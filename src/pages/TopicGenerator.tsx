import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload, X, CheckCircle2, Sparkles, BookOpen, ChevronRight, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import { api, Topic, Roadmap } from "@/lib/api";

const TopicGenerator = () => {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
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

  const pollTask = async (taskId: string, topicName: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await api.getTaskStatus(taskId);
        if (response.status === "SUCCESS") {
          clearInterval(interval);
          setLoading(false);
          toast.success("Roadmap generated!");
          
          // Navigate directly using topic_id from result
          if (response.result?.topic_id) {
            navigate(`/roadmap/${response.result.topic_id}`);
          } else {
            // Fallback: fetch all topics
            const res = await api.getTopics();
            const newTopic = res.find(t => t.title.toLowerCase() === topicName.toLowerCase());
            if (newTopic) navigate(`/roadmap/${newTopic.id}`);
            else fetchTopics();
          }
        } else if (response.status === "FAILURE") {
          clearInterval(interval);
          setLoading(false);
          toast.error("Generation failed: " + (response.result || "Unknown error"));
        }
      } catch (err) {
        clearInterval(interval);
        setLoading(false);
      }
    }, 1500); // 1.5s is a good balance
  };

  const generate = async () => {
    if (!topic.trim() && !uploadedFile) return;
    setLoading(true);
    setRoadmap(null);
    try {
      const res = await api.generateRoadmap(topic);
      pollTask(res.task_id, topic);
    } catch (err: any) {
      toast.error(err.message);
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
    setUploadProgress(0);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-12">
        {/* Topic Generator Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Topic Generator</h1>
              <p className="text-muted-foreground text-sm">Enter any subject or upload a document, and Xynova.ai will engineer a custom learning path.</p>
            </div>

            <div className="space-y-4">
              <div className="glass-card p-2 rounded-xl border border-primary/10 shadow-lg shadow-primary/5 flex gap-3">
                <Input
                  placeholder={uploadedFile ? "Generate from uploaded document..." : "e.g. Astrophysics, Digital Marketing..."}
                  value={topic}
                  disabled={!!uploadedFile}
                  onChange={e => setTopic(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && generate()}
                  className="flex-1 bg-transparent border-0 focus-visible:ring-0 text-base"
                />
                <Button onClick={generate} disabled={loading || (!topic.trim() && !uploadedFile)} className="gradient-bg border-0 text-primary-foreground font-bold px-6 h-11 shadow-lg shadow-purple-500/20">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-4 w-4 mr-2" /> Generate</>}
                </Button>
              </div>

              {uploadedFile && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{uploadedFile.name}</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{uploadedFile.size} • document analyzed</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={removeFile} className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Upload Area */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            {!uploadedFile && !uploading ? (
              <label className="group relative block cursor-pointer">
                <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
                <div className="glass-card p-10 rounded-3xl border-2 border-dashed border-border/50 group-hover:border-primary/50 transition-all text-center space-y-4 bg-muted/5 group-hover:bg-primary/5">
                  <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform group-hover:shadow-xl group-hover:shadow-primary/10">
                    <Upload className="h-8 w-8 text-primary/60 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg">Upload Your Content</h3>
                    <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">Drop your PDF or DOCX here to generate a tailored roadmap from your book.</p>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest bg-muted rounded-md px-2 py-1">PDF</span>
                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest bg-muted rounded-md px-2 py-1">DOCX</span>
                  </div>
                </div>
              </label>
            ) : uploading ? (
              <div className="glass-card p-10 rounded-3xl border border-primary/20 bg-primary/5 space-y-6 text-center shadow-2xl shadow-primary/5">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg">Parsing Document...</h3>
                    <p className="text-xs text-muted-foreground">Extracting core concepts and structuring modules.</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-[10px] font-black tracking-widest text-primary text-right">{uploadProgress}%</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card p-10 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 space-y-6 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-lg">Document Ready!</h3>
                  <p className="text-xs text-muted-foreground">We've indexed "{uploadedFile.name}". Click **Generate** to start your lesson.</p>
                </div>
                <Button variant="ghost" className="text-emerald-600 hover:bg-emerald-50" onClick={removeFile}>Change Document</Button>
              </div>
            )}
          </motion.div>
        </div>

        {!roadmap && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> My Recent Topics
              </h2>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">View All</Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {savedTopics.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  onClick={() => navigate(`/roadmap/${item.id}`)}
                  className="group relative glass-card p-5 cursor-pointer border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-12 translate-x-12 blur-2xl group-hover:bg-primary/10 transition-all" />

                  {/* Delete Button */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => handleDelete(e, item.id)}
                    className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive z-20 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <div className="relative z-10 flex flex-col h-full">
                    <h3 className="font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">{item.title}</h3>
                    <div className="text-xs text-muted-foreground mb-4">Course available</div>

                    <div className="mt-auto space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
                        <span>View Roadmap</span>
                        <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                      </div>
                      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `100%` }}
                          transition={{ duration: 1, delay: 0.5 + (0.1 * i) }}
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {loading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative glass-card p-12 text-center max-w-3xl mx-auto border border-primary/20 bg-primary/5 shadow-2xl shadow-primary/10 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-16 translate-x-16 blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full translate-y-16 -translate-x-16 blur-3xl animate-pulse" />
            
            <div className="relative z-10">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
                <div className="relative rounded-full bg-primary/10 p-4 flex items-center justify-center border border-primary/20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                Architecting Your Roadmap
              </h3>
              <p className="text-sm text-muted-foreground max-w-[400px] mx-auto italic leading-relaxed">
                Analyzing topic depth, extracting core concepts, and structuring interactive modules for your journey.
              </p>
              
              <div className="mt-8 flex justify-center gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -6, 0], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                    className="w-1.5 h-1.5 rounded-full bg-primary"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {roadmap && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6 max-w-3xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{roadmap.topic}</h2>
                <Button variant="outline" size="sm" onClick={() => setRoadmap(null)}>Back to Topics</Button>
              </div>

              <div className="space-y-4">
                {roadmap.units.map((unit, ui) => (
                  <motion.div
                    key={unit.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: ui * 0.1 }}
                    className="glass-card p-6 border border-border/50 hover:border-primary/20 transition-all"
                  >
                    <h3 className="font-bold text-base mb-4 flex items-center gap-3">
                      <span className="gradient-bg text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-lg px-2.5 py-1 min-w-[60px] text-center shadow-lg shadow-purple-500/20">Unit {ui + 1}</span>
                      {unit.title}
                    </h3>
                    <div className="grid gap-2">
                      {unit.lessons.map((lesson, li) => (
                        <Link key={lesson} to={`/lesson/${ui * 3 + li + 1}`}
                          className="flex items-center gap-4 p-4 rounded-xl border border-transparent hover:border-border hover:bg-muted/50 transition-all group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <BookOpen className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium">{lesson}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default TopicGenerator;
