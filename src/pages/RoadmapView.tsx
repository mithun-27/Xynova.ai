import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Save,
  Loader2,
  Sparkles,
  ArrowRight,
  MessageSquare,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ───────────────────────────────────
   Types
   ─────────────────────────────────── */
interface RoadmapUnit {
  id: string;
  title: string;
  lessons: {
    id: string;
    label: string;
    lessonId?: number;
    isCompleted?: boolean;
  }[];
}

interface ParsedRoadmap {
  rootLabel: string;
  units: RoadmapUnit[];
}

/* ───────────────────────────────────
   Parse raw graph into structured data
   ─────────────────────────────────── */
function parseGraph(graph: { nodes: any[]; edges: any[] }): ParsedRoadmap {
  const { nodes, edges } = graph;
  if (!nodes || nodes.length === 0) return { rootLabel: "Roadmap", units: [] };

  const root = nodes.find((n) => n.id === "root");
  const unitNodes = nodes.filter((n) => n.id.startsWith("unit_"));

  // Build children map from edges
  const childrenOf: Record<string, string[]> = {};
  edges.forEach((e: any) => {
    if (!childrenOf[e.source]) childrenOf[e.source] = [];
    childrenOf[e.source].push(e.target);
  });

  const units: RoadmapUnit[] = unitNodes.map((u) => {
    const lessonIds = childrenOf[u.id] || [];
    const lessons = lessonIds
      .map((lid) => {
        const node = nodes.find((n) => n.id === lid);
        if (!node) return null;
        return {
          id: node.id,
          label: node.data?.label || "Untitled",
          lessonId: node.data?.lessonId,
          isCompleted: node.data?.isCompleted || false,
        };
      })
      .filter(Boolean) as any[];
    return { id: u.id, title: u.data?.label || "Unit", lessons };
  });

  return { rootLabel: root?.data?.label || "Roadmap", units };
}

/* ───────────────────────────────────
   Main Component
   ─────────────────────────────────── */
const RoadmapView = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [topicName, setTopicName] = useState("");
  const [roadmap, setRoadmap] = useState<ParsedRoadmap | null>(null);
  const [rawGraph, setRawGraph] = useState<any>(null);

  const fetchRoadmap = useCallback(async () => {
    if (!topicId) return;
    setLoading(true);
    try {
      const data = await api.getRoadmap(parseInt(topicId));
      setTopicName(data.topic);
      if (data.roadmap_graph) {
        setRawGraph(data.roadmap_graph);
        setRoadmap(parseGraph(data.roadmap_graph));
      }
    } catch (err) {
      toast.error("Failed to load roadmap");
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    fetchRoadmap();
  }, [fetchRoadmap]);

  const confirmRoadmap = async () => {
    if (!topicId || !rawGraph) return;
    setConfirming(true);
    try {
      const res = await api.confirmRoadmap(parseInt(topicId), rawGraph.nodes, rawGraph.edges);
      toast.success(res.message);
      await fetchRoadmap();
    } catch (err) {
      toast.error("Failed to confirm roadmap");
    } finally {
      setConfirming(false);
    }
  };

  const saveGraph = async () => {
    if (!topicId || !rawGraph) return;
    setSaving(true);
    try {
      await api.updateRoadmapGraph(parseInt(topicId), rawGraph.nodes, rawGraph.edges);
      toast.success("Roadmap saved!");
    } catch (err) {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const openLesson = (lessonId?: number) => {
    if (lessonId) navigate(`/lesson/${lessonId}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-full w-full flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Loading roadmap...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-3.5rem)] w-full overflow-hidden">
        {/* Header */}
        <header className="px-6 py-3 border-b border-border/50 bg-background/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold truncate max-w-[300px]">{topicName}</h1>
            <span className="text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-purple-500/15 to-violet-500/15 text-primary px-3 py-1 rounded-full border border-primary/10">
              Learning Path
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/tutor?topicId=${topicId}&topicName=${encodeURIComponent(topicName)}`)} className="h-8 text-xs font-bold rounded-xl border-border/60">
              <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-primary" /> Ask Tutor
            </Button>
            <Button onClick={saveGraph} disabled={saving} size="sm" variant="outline" className="h-8 text-xs font-bold rounded-xl border-border/60">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
              Save
            </Button>
            <Button onClick={confirmRoadmap} disabled={confirming} size="sm" className="h-8 text-xs bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 border-0 text-white font-bold shadow-lg shadow-purple-500/20 rounded-xl">
              {confirming ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Sparkles className="h-3.5 w-3.5 mr-1.5" />}
              Confirm & Generate
            </Button>
          </div>
        </header>

        {/* Scrollable Roadmap Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden roadmap-scroll">
          <div className="max-w-5xl mx-auto py-12 px-4 relative">

            {/* ── ROOT NODE ── */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mb-0"
            >
              <div className="relative group">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity" />
                <div className="relative bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white px-10 py-5 rounded-2xl shadow-2xl shadow-purple-500/25">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-7 w-7" />
                    <span className="text-xl font-bold tracking-tight">{roadmap?.rootLabel}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── VERTICAL SPINE ── */}
            <div className="relative">
              {/* Central vertical line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/60 via-primary/30 to-primary/10 -translate-x-1/2" />

              {roadmap?.units.map((unit, unitIdx) => {
                const isLeft = unitIdx % 2 === 0;

                return (
                  <motion.div
                    key={unit.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: unitIdx * 0.08, duration: 0.4 }}
                    className="relative"
                  >
                    {/* ── CONNECTOR DOT on spine ── */}
                    <div className="flex justify-center pt-8 pb-2">
                      <div className="w-4 h-4 rounded-full bg-primary border-4 border-background shadow-lg shadow-primary/30 z-10 relative" />
                    </div>

                    {/* ── UNIT ROW: unit card + lessons ── */}
                    <div className={`flex items-start gap-0 ${isLeft ? "flex-row" : "flex-row-reverse"}`}>

                      {/* Lessons side */}
                      <div className={`flex-1 ${isLeft ? "pr-6" : "pl-6"}`}>
                        <div className={`flex flex-col gap-2.5 ${isLeft ? "items-end" : "items-start"}`}>
                          {unit.lessons.map((lesson, lIdx) => (
                            <motion.div
                              key={lesson.id}
                              initial={{ opacity: 0, x: isLeft ? 20 : -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: unitIdx * 0.08 + lIdx * 0.04, duration: 0.3 }}
                              onClick={() => openLesson(lesson.lessonId)}
                              className={`group relative flex items-center gap-2.5 cursor-pointer max-w-[280px]
                                ${isLeft ? "flex-row-reverse" : "flex-row"}`}
                            >
                              {/* Horizontal connector line */}
                              <div className={`w-6 h-px border-t-2 border-dashed border-primary/20 flex-shrink-0`} />

                              {/* Lesson card */}
                              <div
                                className={`relative px-4 py-2.5 rounded-xl border transition-all duration-200
                                  ${lesson.isCompleted
                                    ? "bg-emerald-500/8 border-emerald-500/25 hover:border-emerald-500/50 hover:shadow-emerald-500/10"
                                    : "bg-card/60 border-border/50 hover:border-primary/40 hover:bg-card/90 hover:shadow-primary/5"
                                  }
                                  hover:shadow-lg hover:-translate-y-0.5 backdrop-blur-sm`}
                              >
                                <div className="flex items-center gap-2">
                                  {lesson.isCompleted ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                                  ) : (
                                    <BookOpen className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary flex-shrink-0 transition-colors" />
                                  )}
                                  <span className={`text-xs font-medium leading-snug ${lesson.isCompleted ? "text-emerald-400" : "text-foreground/80 group-hover:text-foreground"}`}>
                                    {lesson.label}
                                  </span>
                                  <ChevronRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary/60 flex-shrink-0 transition-colors ml-auto" />
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Center: Unit card sits on the spine */}
                      <div className="flex-shrink-0 w-[220px] z-10 relative">
                        {/* Horizontal connector lines from unit to both sides */}
                        <div className={`absolute top-1/2 ${isLeft ? "-left-0" : "-right-0"} w-0 h-px`} />

                        <div className="group relative">
                          <div className="absolute -inset-0.5 bg-gradient-to-b from-primary/30 to-primary/5 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="relative bg-card/95 backdrop-blur-sm border-2 border-primary/30 hover:border-primary/50 px-5 py-3.5 rounded-xl shadow-xl shadow-primary/5 transition-all duration-200">
                            <div className="flex items-center gap-2.5 justify-center">
                              <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-primary/15 flex-shrink-0">
                                <span className="text-[10px] font-black text-primary">{unitIdx + 1}</span>
                              </div>
                              <span className="text-sm font-semibold text-foreground text-center leading-tight">{unit.title}</span>
                            </div>
                            <div className="mt-1.5 text-center">
                              <span className="text-[10px] text-muted-foreground font-medium">{unit.lessons.length} lessons</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Empty side (to balance flexbox) */}
                      <div className={`flex-1 ${isLeft ? "pl-6" : "pr-6"}`} />
                    </div>
                  </motion.div>
                );
              })}

              {/* End dot */}
              <div className="flex justify-center pt-8 pb-4">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 border-4 border-background shadow-lg shadow-primary/30 z-10 flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </div>
              </div>
              <p className="text-center text-xs text-muted-foreground font-medium pb-8">End of Learning Path</p>
            </div>
          </div>
        </div>

        {/* Confirming Overlay */}
        <AnimatePresence>
          {confirming && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-2xl"
            >
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-150 animate-pulse" />
                <div className="relative p-16 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center shadow-2xl shadow-primary/20">
                  <Loader2 className="h-16 w-16 animate-spin text-primary" />
                </div>
              </div>
              <div className="text-center space-y-4 relative z-10 px-6">
                <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-violet-400 to-indigo-500 tracking-tight">
                  Architecting Your Learning Path
                </h2>
                <p className="text-muted-foreground text-base max-w-lg mx-auto font-medium leading-relaxed">
                  Engineering high-quality lessons and quizzes for your personalized curriculum...
                </p>
                <div className="mt-12 flex justify-center gap-3">
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.8, 1], opacity: [0.3, 1, 0.3], y: [0, -10, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                      className="w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/50"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default RoadmapView;
