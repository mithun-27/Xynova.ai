import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload, X, CheckCircle2, Sparkles, BookOpen, ChevronRight, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import { api, Topic, Roadmap } from "@/lib/api";
import { useBackgroundTasks } from "@/context/BackgroundTasksContext";

const TopicGenerator = () => {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [uploading, setUploading] = useState(false);
  const { addTask } = useBackgroundTasks();
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [fileObject, setFileObject] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [savedTopics, setSavedTopics] = useState<Topic[]>([]);
  const navigate = useNavigate();

  const location = useLocation();

  useEffect(() => {
    fetchTopics();
    // Clear roadmap preview when arriving at /topics
    setRoadmap(null);
  }, [location.pathname]);

  const fetchTopics = async () => {
    try {
      const topics = await api.getTopics();
      setSavedTopics(topics);
    } catch (err) {
      console.error("Failed to fetch topics", err);
    }
  };

  const generate = async () => {
    if (!topic.trim() && !uploadedFile) return;
    const topicToUse = topic.trim() || (uploadedFile ? `Document: ${uploadedFile.name}` : "Custom Study Guide");
    setLoading(true);
    setRoadmap(null);
    try {
      const res = await api.generateRoadmap(topicToUse, fileObject);
      addTask(res.task_id, topicToUse);
      toast.success("Generation started", {
        description: `We are architecting your learning path for "${topicToUse}" in the background. You can track its progress in the header task manager.`,
      });
      setTopic("");
      setUploadedFile(null);
      setFileObject(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to start roadmap generation");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, topicId: number) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this topic and all its progress?")) return;
    
    try {
      await api.deleteTopic(topicId);
      toast.success("Topic deleted successfully");
      fetchTopics();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete topic");
    }
  };

  const loadTopic = async (topicId: number) => {
    setLoading(true);
    try {
      const data = await api.getRoadmap(topicId);
      setRoadmap(data);
    } catch (err: any) {
      toast.error("Failed to load roadmap");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      setUploadProgress(0);
      setFileObject(file);

      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setUploadedFile({ name: file.name, size: (file.size / 1024 / 1024).toFixed(2) + " MB" });
            setUploading(false);
            toast.success("Document analyzed successfully!");
            return 100;
          }
          return prev + 10;
        });
      }, 150);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setFileObject(null);
    setUploadProgress(0);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto min-h-[calc(100vh-8rem)] flex flex-col justify-center">
        {/* Topic Generator Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
                <Sparkles className="h-3 w-3" /> AI Powered
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60">
                Roadmap <br />Architect
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                Enter any subject or upload a document, and our AI will engineer a custom professional learning path for you.
              </p>
            </div>

            <div className="space-y-5">
              <div className="glass-card p-2.5 rounded-2xl border border-primary/20 shadow-2xl shadow-primary/5 flex gap-3 backdrop-blur-xl">
                <Input
                  placeholder={uploadedFile ? "Ready to generate from document..." : "What do you want to learn today?"}
                  value={topic}
                  disabled={!!uploadedFile || loading}
                  onChange={e => setTopic(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && generate()}
                  className="flex-1 bg-transparent border-0 focus-visible:ring-0 text-lg py-6"
                />
                <Button 
                    onClick={generate} 
                    disabled={loading || (!topic.trim() && !uploadedFile)} 
                    className="gradient-bg border-0 text-primary-foreground font-black px-8 h-auto rounded-xl shadow-xl shadow-purple-500/20 active:scale-95 transition-all"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Sparkles className="h-5 w-5 mr-2" /> Architect</>}
                </Button>
              </div>

              {uploadedFile && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-4 p-4 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{uploadedFile.name}</p>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Analysis Complete • {uploadedFile.size}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={removeFile} className="h-10 w-10 hover:bg-destructive/10 hover:text-destructive rounded-xl">
                    <X className="h-5 w-5" />
                  </Button>
                </motion.div>
              )}

              <div className="flex items-center gap-6 pt-2">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" />
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground font-medium italic">
                  Join 10,000+ students mastering <br /> new skills with AI roadmaps.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Upload Area */}
          <motion.div initial={{ opacity: 0, x: 25 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
            {!uploadedFile && !uploading ? (
              <label className="group relative block cursor-pointer">
                <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
                <div className="glass-card p-12 rounded-[2.5rem] border-2 border-dashed border-border/50 group-hover:border-primary/50 transition-all text-center space-y-6 bg-muted/5 group-hover:bg-primary/5 hover:shadow-2xl hover:shadow-primary/5">
                  <div className="w-20 h-20 rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform group-hover:rotate-3 group-hover:shadow-2xl group-hover:shadow-primary/20">
                    <Upload className="h-10 w-10 text-primary/60 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-xl">Drop Your Content</h3>
                    <p className="text-sm text-muted-foreground max-w-[240px] mx-auto leading-relaxed">Upload a syllabus, textbook, or notes to generate a tailored path.</p>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] bg-muted/50 border border-border/50 rounded-lg px-3 py-1.5">PDF</span>
                    <span className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] bg-muted/50 border border-border/50 rounded-lg px-3 py-1.5">DOCX</span>
                  </div>
                </div>
              </label>
            ) : uploading ? (
              <div className="glass-card p-12 rounded-[2.5rem] border border-primary/20 bg-primary/5 space-y-8 text-center shadow-2xl shadow-primary/10 backdrop-blur-3xl">
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary shadow-[0_0_20px_rgba(var(--primary),0.5)]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileText className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <h3 className="font-bold text-2xl">Scanning Knowledge</h3>
                    <p className="text-sm text-muted-foreground">Identifying structure and key learning outcomes...</p>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2.5 w-full bg-primary/10 rounded-full overflow-hidden border border-primary/10">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black tracking-[0.2em] text-primary uppercase">Analyzing</span>
                        <span className="text-[11px] font-black tracking-widest text-primary">{uploadProgress}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 rounded-[2.5rem] border border-emerald-500/20 bg-emerald-500/5 space-y-8 text-center shadow-2xl shadow-emerald-500/5">
                <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto border-2 border-emerald-500/20 shadow-inner group">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                </div>
                <div className="space-y-3">
                  <h3 className="font-bold text-2xl">Knowledge Indexed</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We've successfully analyzed **{uploadedFile.name}**. Ready to architect your path.
                  </p>
                </div>
                <Button variant="outline" className="text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10 hover:border-emerald-500/40 rounded-xl" onClick={removeFile}>
                    Wait, let me change that
                </Button>
              </div>
            )}
          </motion.div>
        </div>

        {savedTopics.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16 space-y-6 animate-in fade-in slide-in-from-bottom-5"
          >
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/85">
                  Recent Roadmaps
                </h2>
                <p className="text-muted-foreground text-sm">Pick up where you left off in your learning journeys.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/topics")} className="text-primary font-bold hover:bg-primary/5">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {savedTopics.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/roadmap/${item.id}`)}
                  className="group relative glass-card p-6 cursor-pointer border border-border/50 hover:border-primary/45 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 overflow-hidden rounded-2xl"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-12 translate-x-12 blur-2xl group-hover:bg-primary/10 transition-all" />
                  <div className="relative z-10 flex flex-col h-full space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base group-hover:text-primary transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">Generated {new Date(item.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors pt-2">
                      <span>Resume Journey</span>
                      <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default TopicGenerator;
