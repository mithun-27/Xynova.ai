import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronRight, Loader2, Trash2, Plus, Search, ArrowLeft, Network, Zap, Sparkles, MessageSquare, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import { api, Topic, Roadmap } from "@/lib/api";

const TopicsList = () => {
  const [savedTopics, setSavedTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingRoadmap, setFetchingRoadmap] = useState(false);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const topicIdParam = searchParams.get("topicId");

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const topics = await api.getTopics();
      setSavedTopics(topics);
    } catch (err) {
      console.error("Failed to fetch topics", err);
      toast.error("Failed to load your topics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    const loadRoadmap = async () => {
      if (topicIdParam) {
        setFetchingRoadmap(true);
        try {
          const topicId = parseInt(topicIdParam);
          const roadmapData = await api.getRoadmap(topicId);
          setSelectedRoadmap({ ...roadmapData, topic_id: topicId } as any);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
          toast.error("Failed to load topic details");
          setSearchParams({});
        } finally {
          setFetchingRoadmap(false);
        }
      } else {
        setSelectedRoadmap(null);
      }
    };
    loadRoadmap();
  }, [topicIdParam, setSearchParams]);

  const handleTopicClick = (topicId: number) => {
    setSearchParams({ topicId: topicId.toString() });
  };

  const handleDelete = async (e: React.MouseEvent, topicId: number) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this topic and all its progress?")) return;
    
    try {
      await api.deleteTopic(topicId);
      toast.success("Topic deleted successfully");
      if (selectedRoadmap && (selectedRoadmap as any).topic_id === topicId) {
        setSelectedRoadmap(null);
      }
      fetchTopics();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete topic");
    }
  };

  const filteredTopics = savedTopics.filter(topic => 
    topic.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        <AnimatePresence mode="wait">
          {topicIdParam && !selectedRoadmap ? (
             <motion.div 
                 key="loading-curriculum" 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="h-[60vh] flex flex-col items-center justify-center"
             >
                 <div className="relative">
                   <div className="absolute inset-0 bg-primary/20 blur-[50px] rounded-full animate-pulse" />
                   <Loader2 className="h-10 w-10 animate-spin text-primary relative z-10" />
                 </div>
                 <p className="text-sm text-muted-foreground mt-4 font-medium italic">Opening your course...</p>
             </motion.div>
          ) : !selectedRoadmap ? (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                    My Learning Library
                  </h1>
                  <p className="text-muted-foreground text-sm mt-1">Manage and continue your generated learning paths.</p>
                </div>
                <Button 
                  onClick={() => navigate("/roadmap")} 
                  className="gradient-bg border-0 text-white font-bold shadow-lg shadow-purple-500/20 rounded-xl"
                >
                  <Plus className="h-4 w-4 mr-2" /> New Roadmap
                </Button>
              </div>

              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search your topics..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/50 border-border/50 focus:border-primary/50 rounded-xl"
                />
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="glass-card p-6 border border-border/50 rounded-2xl animate-pulse">
                      <div className="w-12 h-12 rounded-xl bg-muted mb-4" />
                      <div className="h-5 w-3/4 bg-muted rounded mb-2" />
                      <div className="h-4 w-1/2 bg-muted rounded mb-6" />
                      <div className="h-1.5 w-full bg-muted rounded-full" />
                    </div>
                  ))}
                </div>
              ) : filteredTopics.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredTopics.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 * i }}
                      onClick={() => handleTopicClick(item.id)}
                      className="group relative glass-card p-6 cursor-pointer border border-border/50 hover:border-primary/40 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 overflow-hidden rounded-2xl"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16 blur-3xl group-hover:bg-primary/10 transition-all" />

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => handleDelete(e, item.id)}
                        className="absolute top-3 right-3 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive z-20 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      <div className="relative z-10 flex flex-col h-full">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        
                        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                          {item.title}
                        </h3>
                        
                        <div className="mt-auto pt-6 space-y-4">
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                            <span>Open Course</span>
                            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `100%` }}
                              transition={{ duration: 1, delay: 0.2 + (0.05 * i) }}
                              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 rounded-full"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="glass-card p-20 text-center border-dashed border-2 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                    <BookOpen className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No topics found</h3>
                  <p className="text-muted-foreground max-w-sm mb-6">
                    {searchQuery ? `No results for "${searchQuery}". Try a different term.` : "You haven't generated any learning paths yet. Start by creating a new roadmap!"}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => navigate("/roadmap")} className="gradient-bg border-0">
                      Create Your First Path
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="lessons"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-border/50">
                <div className="space-y-1">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSearchParams({})}
                        className="p-0 h-auto hover:bg-transparent text-primary font-bold flex items-center gap-1.5 mb-2 group"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Back to Library
                    </Button>
                    <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70">
                        {selectedRoadmap.topic}
                    </h1>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        onClick={() => navigate(`/roadmap/${(selectedRoadmap as any).topic_id}`)}
                        className="rounded-xl border-primary/20 hover:bg-primary/5 text-primary font-bold shadow-xl shadow-primary/5"
                    >
                        <Network className="h-4 w-4 mr-2" /> View Roadmap Path
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => handleDelete(e, (selectedRoadmap as any).topic_id)}
                        className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                    >
                        <Trash2 className="h-5 w-5" />
                    </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-6">
                    {selectedRoadmap.units.map((unit, ui) => (
                    <motion.div
                        key={unit.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: ui * 0.1 }}
                        className="glass-card p-8 border border-border/40 bg-card/40 hover:border-primary/20 transition-all rounded-3xl"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-black text-xl flex items-center gap-4">
                                <span className="flex items-center justify-center gradient-bg text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] rounded-xl px-4 py-2 shadow-lg shadow-purple-500/20">
                                    Unit {ui + 1}
                                </span>
                                {unit.title}
                            </h3>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{unit.lessons.length} Modules</span>
                        </div>
                        
                        <div className="grid gap-3">
                        {unit.lessons.map((lesson, li) => {
                            const isObject = typeof lesson !== 'string';
                            const lessonTitle = isObject ? (lesson as any).title : lesson;
                            const lessonId = isObject ? (lesson as any).id : (ui * 3 + li + 1);
                            const isCompleted = isObject ? (lesson as any).is_completed : false;

                            return (
                                <Link 
                                    key={lessonId} 
                                    to={`/lesson/${lessonId}`}
                                    className="flex items-center gap-4 p-5 rounded-2xl border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="z-10 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shadow-inner">
                                        {isCompleted ? (
                                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                        ) : (
                                            <BookOpen className="h-5 w-5 text-primary" />
                                        )}
                                    </div>
                                    <span className={`z-10 text-base font-bold transition-colors ${isCompleted ? 'text-muted-foreground line-through decoration-emerald-500/30' : 'text-foreground/80 group-hover:text-primary'}`}>
                                        {lessonTitle}
                                    </span>
                                    <div className="z-10 ml-auto flex items-center gap-2">
                                        <span className="text-[10px] font-black text-primary/40 group-hover:text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                                            {isCompleted ? 'Review Lesson' : 'Start Lesson'}
                                        </span>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                                    </div>
                                </Link>
                            );
                        })}
                        </div>
                    </motion.div>
                    ))}
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card p-6 border border-primary/20 bg-primary/5 rounded-3xl sticky top-24">
                        <h4 className="font-bold text-lg mb-4">Course Analytics</h4>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                    <span className="text-muted-foreground">Overall Completion</span>
                                    <span className="text-primary">0%</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-0" />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border/50 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                        <Zap className="h-4 w-4 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold">Estimated Time</p>
                                        <p className="text-[10px] text-muted-foreground uppercase">{selectedRoadmap.units.length * 45} Minutes Total</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                        <Sparkles className="h-4 w-4 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold">Difficulty</p>
                                        <p className="text-[10px] text-muted-foreground uppercase">AI Personalized</p>
                                    </div>
                                </div>
                            </div>

                            <Button 
                                onClick={() => navigate(`/tutor?topicId=${(selectedRoadmap as any).topic_id}&topicName=${encodeURIComponent(selectedRoadmap.topic)}`)}
                                className="w-full h-12 rounded-2xl bg-foreground text-background font-bold hover:bg-foreground/90 transition-all border-0"
                            >
                                <MessageSquare className="h-4 w-4 mr-2" /> Open AI Tutor
                            </Button>
                        </div>
                    </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default TopicsList;
