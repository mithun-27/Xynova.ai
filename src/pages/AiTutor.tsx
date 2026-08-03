import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, BookOpen, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/DashboardLayout";
import { api } from "@/lib/api";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = { role: "user" | "assistant"; content: string; reasoning_details?: string };

const AiTutor = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get context from URL or navigation state
  const topicId = parseInt(searchParams.get("topicId") || location.state?.topicId || "0");
  const lessonId = parseInt(searchParams.get("lessonId") || location.state?.lessonId || "0");
  const topicName = searchParams.get("topicName") || location.state?.topicName || "Selected Topic";
  const lessonTitle = searchParams.get("lessonTitle") || location.state?.lessonTitle || "Current Module";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = async () => {
    if (!input.trim() || typing) return;
    if (!topicId) {
        toast.error("No topic context found. Please select a topic first.");
        return;
    }
    
    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        content: m.content,
        reasoning_details: m.reasoning_details
      }));
      
      const res: any = await api.sendMessage(topicId, input, lessonId || undefined, history);
      const assistantMsg: Message = { 
        role: "assistant", 
        content: res.answer || res.response || "I'm analyzing your question...", 
        reasoning_details: res.reasoning_details || res.reasoning
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Chat failed", err);
      toast.error("Tutor connection lost. Please try again.");
    } finally {
      setTyping(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-3.5rem)]">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-background/50 backdrop-blur-sm">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-40 grayscale pointer-events-none">
                    <Bot className="h-16 w-16 mb-4 text-primary" />
                    <p className="text-sm font-medium">Your AI Tutor is ready to help with {topicName}</p>
                </div>
            )}
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex gap-4 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="gradient-bg rounded-xl p-2.5 h-10 w-10 shrink-0 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                )}
                <div className={`max-w-xl rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm border border-border/50 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-card rounded-bl-none"
                }`}>
                  {msg.role === "user" ? (
                    msg.content
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none
                      prose-p:leading-relaxed prose-p:my-1.5 first:prose-p:mt-0 last:prose-p:mb-0
                      prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
                      prose-ul:my-1.5 prose-ol:my-1.5 prose-ul:list-disc prose-ol:list-decimal prose-li:my-0.5
                      prose-strong:font-semibold prose-strong:text-foreground
                      prose-code:bg-muted/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono prose-code:text-[0.85em] prose-code:before:content-none prose-code:after:content-none
                      prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-border/40 prose-pre:rounded-xl prose-pre:p-4 prose-pre:my-3 prose-pre:shadow-lg
                      prose-blockquote:border-l-4 prose-blockquote:border-primary/45 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-2 prose-blockquote:text-muted-foreground
                    ">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => <h1 className="text-base font-extrabold mt-4 mb-2 first:mt-0">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-sm font-extrabold mt-3 mb-1.5 first:mt-0">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-xs font-bold mt-2 mb-1 first:mt-0">{children}</h3>,
                          p: ({ children }) => <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>,
                          ul: ({ children }) => <ul className="my-1.5 space-y-1 list-disc list-inside marker:text-primary/70">{children}</ul>,
                          ol: ({ children }) => <ol className="my-1.5 space-y-1 list-decimal list-inside marker:text-primary/70">{children}</ol>,
                          li: ({ children }) => <li className="text-muted-foreground text-sm pl-1">{children}</li>,
                          code: ({ className, children }) => {
                            const hasLang = /language-(\w+)/.exec(className || "");
                            return !hasLang ? (
                              <code className="bg-muted/60 px-1.5 py-0.5 rounded-md font-mono text-[0.85em] text-foreground font-semibold">
                                {children}
                              </code>
                            ) : (
                              <pre className="p-4 rounded-xl bg-zinc-950 border border-border/40 overflow-x-auto my-3 shadow-lg">
                                <code className={className}>{children}</code>
                              </pre>
                            );
                          }
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="bg-muted rounded-xl p-2.5 h-10 w-10 shrink-0 flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </motion.div>
            ))}
            {typing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                <div className="gradient-bg rounded-xl p-2.5 h-10 w-10 shrink-0 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="bg-card rounded-2xl rounded-bl-none px-5 py-4 border border-border/50">
                  <div className="flex gap-1.5 px-2">
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-6 bg-card/80 backdrop-blur-md">
            <div className="flex gap-3 max-w-4xl mx-auto items-center">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full h-10 w-10">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="relative flex-1">
                    <Input
                        placeholder={`Ask about ${topicName}...`}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && send()}
                        className="h-12 pl-4 pr-12 rounded-2xl bg-muted/50 border-border/50 focus:border-primary/50 transition-all text-sm"
                    />
                    <Button 
                        onClick={send} 
                        disabled={!input.trim() || typing} 
                        className="absolute right-1 top-1 h-10 w-10 p-0 rounded-xl gradient-bg border-0 text-white hover:scale-105 transition-transform"
                    >
                        {typing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                </div>
            </div>
          </div>
        </div>

        {/* Context Panel */}
        <aside className="w-80 border-l border-border p-8 hidden lg:flex flex-col bg-card/50 backdrop-blur-sm">
          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-6">Learning Context</h3>
          <div className="space-y-6">
            <div className="glass-card p-5 rounded-2xl border border-primary/10 bg-primary/5 shadow-inner">
                <div className="flex items-center gap-3 mb-3">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Active Topic</span>
                </div>
                <p className="font-bold text-foreground leading-tight">{topicName}</p>
            </div>

            {lessonId > 0 && (
                <div className="glass-card p-5 rounded-2xl border border-accent/10 bg-accent/5">
                    <div className="text-xs font-bold uppercase tracking-wider text-accent mb-3">Current Module</div>
                    <p className="text-sm font-medium text-foreground">{lessonTitle}</p>
                </div>
            )}

            <div className="mt-auto pt-10">
                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed uppercase tracking-widest opacity-60">
                    Our AI tutor has processed your full roadmap and is ready to answer specific technical questions.
                </p>
            </div>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
};

export default AiTutor;
