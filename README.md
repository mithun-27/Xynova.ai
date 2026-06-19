# Xynova.ai 🚀

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-xynova.web.app-4285F4?style=for-the-badge)](https://xynova.web.app)
[![API Status](https://img.shields.io/badge/🔗_Backend_API-xynova--ai.onrender.com-46E3B7?style=for-the-badge)](https://xynova-ai.onrender.com)
[![GitHub Release](https://img.shields.io/github/v/release/mithun-27/Xynova.ai?style=for-the-badge&color=purple)](https://github.com/mithun-27/Xynova.ai/releases)

**Xynova.ai** is a state-of-the-art personalized learning platform that engineers custom roadmaps for any subject. Powered by advanced AI reasoning, it provides structured modules, interactive tutoring, and progress tracking to help students master complex topics efficiently.

---

## 🌐 Live Deployment

| Service | URL | Platform |
| :--- | :--- | :--- |
| **Frontend** | [xynova.web.app](https://xynova.web.app) | Firebase Hosting |
| **Backend API** | [xynova-ai.onrender.com](https://xynova-ai.onrender.com) | Render |
| **Database** | Supabase PostgreSQL | Supabase |
| **Task Queue** | Upstash Redis | Upstash |

---

## ✨ Features

- 🎯 **AI Roadmap Generation** — Personalized learning paths based on your subject or uploaded documents (.txt, .pdf, .docx).
- 📄 **Document-Based Learning** — Upload a syllabus or textbook and get a tailored roadmap from its contents.
- 💬 **AI Tutor** — Context-aware chat assistant for deep explanations and Q&A.
- 📊 **Progress Analytics** — Track your mastery across lessons and quizzes.
- ⚡ **Background Processing** — Generate roadmaps in the background while browsing other features.
- 🔐 **Secure Authentication** — JWT-based secure login and registration.

---

## 🛠️ Technology Stack

### Frontend
- **React 18** + **Vite**
- **TypeScript**
- **Tailwind CSS** + **Shadcn UI**
- **Framer Motion** (Animations)
- **Lucide React** (Icons)

### Backend
- **FastAPI** (Python 3.11+)
- **SQLAlchemy** (PostgreSQL)
- **Celery** + **Redis** (Background Tasks)
- **OpenRouter API** (LLM Integration)
- **Pydantic** (Validation)

### Infrastructure
- **Firebase Hosting** (Frontend CDN)
- **Render** (Backend Web Service)
- **Supabase** (PostgreSQL Database)
- **Upstash** (Serverless Redis)
- **GitHub Actions** (CI/CD)

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js & npm
- Python 3.11+
- Docker & Docker Compose (for PostgreSQL/Redis)

### 2. Infrastructure Setup
```bash
cd backend
docker-compose up -d
```

### 3. Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Celery Worker Setup
```bash
cd backend
.\venv\Scripts\celery -A app.workers.celery_worker worker --loglevel=info -P solo -Q zynova_queue
```

### 5. Frontend Setup
```bash
npm install
npm run dev
```

---

## 🔖 Versioning

This project uses [Semantic Versioning](https://semver.org/). To create a new release:

```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions will automatically create a release on the [Releases page](https://github.com/mithun-27/Xynova.ai/releases).

---

## 📝 License

Distributed under the MIT License.

---

Built with ❤️ by the Xynova AI Team.
