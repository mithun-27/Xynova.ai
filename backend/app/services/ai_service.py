import json
import re
import httpx
import logging
import time
from app.core.config import settings
from app.schemas.topic import AIRoadmap
from app.schemas.quiz import QuizQuestionBase
from typing import List, Optional

logger = logging.getLogger("xynova_ai")

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

# Timeouts: (connect, read) in seconds
PRIMARY_TIMEOUT = httpx.Timeout(10.0, read=60.0)
FALLBACK_TIMEOUT = httpx.Timeout(10.0, read=90.0)


class AIService:

    @staticmethod
    async def _post_request(payload: dict, timeout: httpx.Timeout = PRIMARY_TIMEOUT) -> dict:
        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        }
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(OPENROUTER_URL, headers=headers, json=payload)
            response.raise_for_status()
            return response.json()

    @staticmethod
    async def _call_with_fallback(payload: dict) -> dict:
        """
        Production-grade AI call: tries primary model first, falls back to secondary.
        Logs timing for observability.
        """
        primary_model = settings.AI_MODEL
        fallback_model = settings.AI_MODEL_FALLBACK

        # --- Attempt 1: Primary model ---
        payload_primary = {**payload, "model": primary_model}
        start = time.time()
        try:
            logger.info(f"AI call: {primary_model} | prompt={payload['messages'][-1]['content'][:60]}...")
            data = await AIService._post_request(payload_primary, timeout=PRIMARY_TIMEOUT)
            elapsed = time.time() - start
            logger.info(f"AI OK: {primary_model} responded in {elapsed:.1f}s")
            return data
        except (httpx.ReadTimeout, httpx.ConnectTimeout) as e:
            elapsed = time.time() - start
            logger.warning(f"AI TIMEOUT: {primary_model} after {elapsed:.1f}s — falling back to {fallback_model}")
        except httpx.HTTPStatusError as e:
            elapsed = time.time() - start
            logger.warning(f"AI HTTP ERROR: {primary_model} {e.response.status_code} after {elapsed:.1f}s — falling back")
        except Exception as e:
            elapsed = time.time() - start
            logger.warning(f"AI ERROR: {primary_model} {type(e).__name__} after {elapsed:.1f}s — falling back")

        # --- Attempt 2: Fallback model ---
        payload_fallback = {**payload, "model": fallback_model}
        start = time.time()
        try:
            logger.info(f"AI fallback: {fallback_model}")
            data = await AIService._post_request(payload_fallback, timeout=FALLBACK_TIMEOUT)
            elapsed = time.time() - start
            logger.info(f"AI OK (fallback): {fallback_model} responded in {elapsed:.1f}s")
            return data
        except Exception as e:
            elapsed = time.time() - start
            logger.error(f"AI FAILED (both models): {fallback_model} {type(e).__name__} after {elapsed:.1f}s")
            raise

    # ─── ROADMAP ────────────────────────────────────────────────
    @staticmethod
    async def generate_roadmap(topic: str, document_content: Optional[str] = None) -> AIRoadmap:
        if document_content:
            prompt = f"""Generate a learning roadmap for "{topic}" based strictly on the following uploaded document content:
---
{document_content[:15000]}
---
Return JSON: {{"topic":"{topic}","units":[{{"title":"Unit","lessons":["Lesson1","Lesson2"]}}]}}. Create 5-8 units with 2-3 lessons each covering the material in the document. Short lesson names only."""
        else:
            prompt = f"""Generate a learning roadmap for "{topic}". Return JSON: {{"topic":"{topic}","units":[{{"title":"Unit","lessons":["Lesson1","Lesson2"]}}]}}. Create 5-8 units with 2-3 lessons each. Short lesson names only."""
            
        payload = {
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"},
            "max_tokens": 2000
        }
        data = await AIService._call_with_fallback(payload)
        content = data['choices'][0]['message']['content']
        return AIRoadmap.model_validate_json(content)

    # ─── MARKDOWN NORMALIZER ────────────────────────────────────
    @staticmethod
    def normalize_markdown(content: str) -> str:
        if not content:
            return ""

        lines = content.split('\n')
        repaired_lines = []
        in_table = False
        header_pipe_count = 0

        for line in lines:
            trimmed = line.strip()
            is_table_line = len(re.findall(r'\|', trimmed)) >= 2

            if is_table_line:
                # Only strip formatting inside table cells
                processed = re.sub(r'^\d+\.\s+', '', trimmed)
                processed = re.sub(r'^#+\s*', '', processed)
                processed = processed.replace('**', '')

                if not processed.startswith('|'):
                    processed = f"| {processed}"
                if not processed.endswith('|'):
                    processed = f"{processed} |"

                current_pipes = len(re.findall(r'\|', processed))

                if not in_table:
                    in_table = True
                    header_pipe_count = current_pipes
                    repaired_lines.append("\n" + processed)
                    continue

                if '---' in processed:
                    repaired_lines.append("|" + "---| " * (header_pipe_count - 1))
                    continue

                diff = header_pipe_count - current_pipes
                if diff > 0:
                    processed = processed[:len(processed)-1] + " | " * diff + "|"

                repaired_lines.append(processed)
            else:
                if in_table:
                    in_table = False
                    repaired_lines.append("\n" + line)
                else:
                    repaired_lines.append(line)

        final_content = "\n".join(repaired_lines)
        final_content = final_content.replace('||', '|')
        final_content = re.sub(r'\n{4,}', '\n\n\n', final_content)

        # Ensure blank lines before and after headers for proper markdown rendering
        final_content = re.sub(r'([^\n])\n(#{1,3} )', r'\1\n\n\2', final_content)
        final_content = re.sub(r'(#{1,3} .+)\n([^\n#>-])', r'\1\n\n\2', final_content)

        return final_content

    # ─── LESSON CONTENT ─────────────────────────────────────────
    @staticmethod
    async def generate_lesson_content(topic: str, lesson_title: str, document_content: Optional[str] = None) -> str:
        system_msg = """You are an expert course instructor. You write beautifully structured lessons in Markdown.

STRICT FORMATTING RULES:
- Start with a brief 2-3 sentence introduction paragraph
- Use ## for major section headers (always add a blank line before and after headers)
- Use ### for sub-section headers
- Use bullet lists (- item) for listing concepts, NOT inline text
- Use numbered lists (1. item) for sequential steps
- Use ```python for code examples (always with language tag)
- Use **bold** for key terms when first introduced
- Use > blockquotes for important tips or notes
- Add a blank line between every paragraph and every section
- End with a "## 📚 Resources" section with 3-5 real learning links
- Keep content around 600-900 words
- DO NOT output everything as one wall of text
- Every section MUST have proper spacing"""

        if document_content:
            user_msg = f"""Write a lesson on "{lesson_title}" for a course on "{topic}" based on the following uploaded document content:
---
{document_content[:8000]}
---

Structure it EXACTLY like this:

## Introduction
Brief intro paragraph here.

## [Core Concept 1]
Explanation with **bold key terms**.

- Bullet point 1
- Bullet point 2
- Bullet point 3

### [Sub-topic if relevant]
More detail here.

```python
# code example if relevant
example_code()
```

## [Core Concept 2]
Continue with more content...

## Key Takeaways
- Takeaway 1
- Takeaway 2
- Takeaway 3

## 📚 Resources
- [Resource Name](https://real-url.com) - Brief description
- [Resource Name](https://real-url.com) - Brief description
- [Resource Name](https://real-url.com) - Brief description

Now write the actual lesson following this exact format. Use real, working URLs for resources (official docs, MDN, W3Schools, GeeksforGeeks, Real Python, Khan Academy, Coursera, etc)."""
        else:
            user_msg = f"""Write a lesson on "{lesson_title}" for a course on "{topic}".

Structure it EXACTLY like this:

## Introduction
Brief intro paragraph here.

## [Core Concept 1]
Explanation with **bold key terms**.

- Bullet point 1
- Bullet point 2
- Bullet point 3

### [Sub-topic if relevant]
More detail here.

```python
# code example if relevant
example_code()
```

## [Core Concept 2]
Continue with more content...

## Key Takeaways
- Takeaway 1
- Takeaway 2
- Takeaway 3

## 📚 Resources
- [Resource Name](https://real-url.com) - Brief description
- [Resource Name](https://real-url.com) - Brief description
- [Resource Name](https://real-url.com) - Brief description

Now write the actual lesson following this exact format. Use real, working URLs for resources (official docs, MDN, W3Schools, GeeksforGeeks, Real Python, Khan Academy, Coursera, etc)."""

        payload = {
            "messages": [
                {"role": "system", "content": system_msg},
                {"role": "user", "content": user_msg}
            ],
            "max_tokens": 3000
        }
        data = await AIService._call_with_fallback(payload)
        raw_content = data['choices'][0]['message']['content']
        return AIService.normalize_markdown(raw_content)

    # ─── QUIZ ────────────────────────────────────────────────────
    @staticmethod
    async def generate_quiz(lesson_title: str, lesson_content: str) -> List[QuizQuestionBase]:
        prompt = f"""Generate 3 MCQs about "{lesson_title}". Content: {lesson_content[:1000]}. Return JSON: {{"questions":[{{"question":"...","options":["A","B","C","D"],"correct_answer":"A","explanation":"..."}}]}}"""
        payload = {
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"},
            "max_tokens": 1200
        }
        data = await AIService._call_with_fallback(payload)
        content = json.loads(data['choices'][0]['message']['content'])
        return [QuizQuestionBase(**q) for q in content["questions"]]

    # ─── CHAT ────────────────────────────────────────────────────
    @staticmethod
    async def get_chat_response(messages: List[dict]) -> dict:
        payload = {
            "messages": messages,
            "max_tokens": 1500
        }
        data = await AIService._call_with_fallback(payload)
        message = data['choices'][0]['message']
        return {"content": message.get("content")}


ai_service = AIService()
