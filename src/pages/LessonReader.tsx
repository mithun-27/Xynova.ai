import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Sparkles, BookOpen, CheckCircle2, Loader2, ArrowLeft, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link, useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import ReactMarkdown from "react-markdown";
import { api, Lesson } from "@/lib/api";
import { toast } from "sonner";
import remarkGfm from "remark-gfm";

const LessonReader = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  const handleRegenerate = async () => {
    if (!lessonId) return;
    setRegenerating(true);
    try {
      toast.info("Regenerating lesson with improved formatting...");
      const data = await api.regenerateLesson(parseInt(lessonId));
      setLesson(data);
      toast.success("Lesson regenerated successfully! ✨");
    } catch (err: any) {
      toast.error(err?.message || "Failed to regenerate lesson");
    } finally {
      setRegenerating(false);
    }
  };

  const fetchLesson = async () => {
    if (!lessonId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getLesson(parseInt(lessonId));
      // Check if response has an error field (503 from backend)
      if ((data as any).error) {
        setError((data as any).error);
        setLesson(data);
      } else {
        setLesson(data);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load lesson. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const handleToggleComplete = async () => {
    if (!lessonId) return;
    setMarking(true);
    const newState = !completed;
    try {
      await api.markComplete(parseInt(lessonId), newState);
      setCompleted(newState);
      toast.success(newState ? "Lesson marked as complete! 🏆" : "Progress updated.");
    } catch (err) {
      toast.error("Failed to update progress");
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-screen w-full flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full animate-pulse" />
            <Loader2 className="h-10 w-10 animate-spin text-primary relative z-10" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">Generating your lesson...</p>
          <p className="text-xs text-muted-foreground/50">Usually takes 10-30 seconds</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || (lesson && !lesson.content)) {
    return (
      <DashboardLayout>
        <div className="h-screen w-full flex flex-col items-center justify-center space-y-6 px-4">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <BookOpen className="h-7 w-7 text-destructive" />
            </div>
            <h2 className="text-lg font-bold">Couldn't generate lesson</h2>
            <p className="text-sm text-muted-foreground max-w-md">
              {error || "The AI service is temporarily busy. This is normal with free-tier models."}
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={fetchLesson} className="bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold rounded-xl shadow-lg">
              <Sparkles className="h-4 w-4 mr-2" /> Try Again
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)} className="rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!lesson) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center">
            <h2 className="text-xl font-bold mb-4">Lesson not found</h2>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-3.5rem)]">
        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-background/50 backdrop-blur-sm">
          {/* Reading Progress */}
          <div className="sticky top-0 z-20">
            <Progress value={completed ? 100 : 30} className="h-1 rounded-none bg-primary/10" />
          </div>

          <div className="p-8 max-w-4xl mx-auto">
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-8">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <div className="flex gap-2">
                    <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-9 border-primary/10 hover:bg-primary/5"
                        onClick={handleRegenerate}
                        disabled={regenerating || loading}
                    >
                        <RotateCw className={`h-4 w-4 mr-2 text-primary ${regenerating ? 'animate-spin' : ''}`} /> 
                        {regenerating ? "Regenerating..." : "Regenerate"}
                    </Button>
                    <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-9 border-primary/10 hover:bg-primary/5"
                        onClick={() => navigate(`/tutor?topicId=${lesson.topic_id}&lessonId=${lesson.id || lessonId}&topicName=${encodeURIComponent("Current Topic")}&lessonTitle=${encodeURIComponent(lesson.title)}`)}
                    >
                        <MessageSquare className="h-4 w-4 mr-2 text-primary" /> Ask AI Tutor
                    </Button>
                    <Link to="/quiz">
                        <Button size="sm" variant="outline" className="h-9 border-accent/10 hover:bg-accent/5">
                            <BookOpen className="h-4 w-4 mr-2 text-accent" /> Take Quiz
                        </Button>
                    </Link>
                    <Button
                        size="sm"
                        onClick={handleToggleComplete}
                        disabled={marking}
                        className={`h-9 font-bold transition-all ${
                            completed 
                            ? "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20" 
                            : "gradient-bg text-white border-0 shadow-lg shadow-purple-500/20"
                        }`}
                        variant={completed ? "outline" : "default"}
                    >
                        {marking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                        {completed ? "Completed" : "Mark Complete"}
                    </Button>
                </div>
            </div>

            {/* Lesson Container */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-10 rounded-3xl border border-border/50 shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                
                <h1 className="text-4xl font-extrabold mb-8 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                    {lesson.title}
                </h1>

                {/* Markdown Content */}
                <div className="prose prose-lg dark:prose-invert max-w-none
                    prose-headings:font-bold prose-headings:tracking-tight
                    prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:my-4
                    prose-strong:text-foreground prose-strong:font-semibold
                    prose-code:bg-muted/50 prose-code:text-primary prose-code:px-2 prose-code:py-0.5 prose-code:rounded-lg prose-code:text-[0.9em] prose-code:before:content-none prose-code:after:content-none
                    prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-border/50 prose-pre:rounded-2xl prose-pre:p-6 prose-pre:shadow-xl
                    prose-li:text-muted-foreground prose-li:my-1
                    prose-ul:my-4 prose-ol:my-4
                    prose-img:rounded-2xl prose-img:shadow-2xl
                    prose-hr:border-border/50 prose-hr:my-8
                    prose-blockquote:border-primary/40 prose-blockquote:bg-primary/5 prose-blockquote:rounded-xl prose-blockquote:py-1 prose-blockquote:px-5 prose-blockquote:not-italic
                ">
                    <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                            h2: ({ children }) => (
                                <h2 className="text-2xl font-extrabold mt-10 mb-4 pb-2 border-b border-border/30 text-foreground flex items-center gap-2">
                                    {children}
                                </h2>
                            ),
                            h3: ({ children }) => (
                                <h3 className="text-lg font-bold mt-8 mb-3 text-foreground/90">
                                    {children}
                                </h3>
                            ),
                            p: ({ children }) => (
                                <p className="text-muted-foreground leading-relaxed my-4 text-[15px]">
                                    {children}
                                </p>
                            ),
                            ul: ({ children }) => (
                                <ul className="my-4 space-y-2 list-disc list-inside marker:text-primary/60">
                                    {children}
                                </ul>
                            ),
                            ol: ({ children }) => (
                                <ol className="my-4 space-y-2 list-decimal list-inside marker:text-primary/60 marker:font-bold">
                                    {children}
                                </ol>
                            ),
                            li: ({ children }) => (
                                <li className="text-muted-foreground text-[15px] leading-relaxed pl-1">
                                    {children}
                                </li>
                            ),
                            blockquote: ({ children }) => (
                                <blockquote className="my-6 border-l-4 border-primary/40 bg-primary/5 rounded-r-xl py-3 px-5 text-muted-foreground not-italic">
                                    {children}
                                </blockquote>
                            ),
                            table: ({ children }) => (
                                <div className="my-10 w-full overflow-x-auto rounded-3xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-2xl">
                                    <table className="w-full border-collapse text-sm min-w-[600px]">
                                        {children}
                                    </table>
                                </div>
                            ),
                            thead: ({ children }) => (
                                <thead className="bg-primary/10 border-b border-border/50 uppercase text-[11px] tracking-wider">
                                    {children}
                                </thead>
                            ),
                            th: ({ children }) => (
                                <th className="px-8 py-5 text-left font-extrabold text-foreground border-r border-border/20 last:border-r-0">
                                    {children}
                                </th>
                            ),
                            td: ({ children }) => (
                                <td className="px-8 py-5 border-b border-border/20 text-muted-foreground leading-relaxed font-medium align-top border-r border-border/10 last:border-r-0 last:border-b-0">
                                    {children}
                                </td>
                            ),
                            a: ({ href, children }) => (
                                <a 
                                    href={href} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary hover:text-primary/80 underline decoration-primary/30 underline-offset-4 font-semibold transition-all hover:decoration-primary inline-flex items-center gap-1"
                                >
                                    {children}
                                    <svg className="w-3 h-3 opacity-50 inline-block flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </a>
                            ),
                            code: ({ className, children }) => {
                                const hasLang = /language-(\w+)/.exec(className || "");
                                return !hasLang ? (
                                    <code className="bg-primary/5 border border-primary/10 px-2 py-1 rounded-lg text-primary font-mono text-[0.85em] font-semibold">
                                        {children}
                                    </code>
                                ) : (
                                    <pre className="p-8 rounded-3xl bg-[#0d1117] border border-border/50 overflow-x-auto my-10 shadow-3xl">
                                        <code className={className}>{children}</code>
                                    </pre>
                                );
                            }
                        }}
                    >
                        {lesson.content}
                    </ReactMarkdown>
                </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LessonReader;
