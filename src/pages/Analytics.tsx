import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Trophy, Clock, Flame, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { api, Analytics as AnalyticsType } from "@/lib/api";

const lessonsData = [
  { week: "W1", lessons: 1 }, { week: "W2", lessons: 2 }, { week: "W3", lessons: 1 },
  { week: "W4", lessons: 4 }, { week: "W5", lessons: 3 }, { week: "W6", lessons: 5 },
];

const streakData = [
  { day: "Mon", minutes: 45 }, { day: "Tue", minutes: 60 }, { day: "Wed", minutes: 30 },
  { day: "Thu", minutes: 90 }, { day: "Fri", minutes: 55 }, { day: "Sat", minutes: 120 },
  { day: "Sun", minutes: 40 },
];

const chartStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
};

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } })
};

const Analytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const data = await api.getAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const metrics = [
    { label: "Total Lessons", value: loading ? "–" : (analytics?.lessons_completed?.toString() || "0"), icon: BookOpen, color: "bg-primary/10 text-primary" },
    { label: "Completion Rate", value: loading ? "–" : `${Math.round(analytics?.progress_percentage || 0)}%`, icon: Trophy, color: "bg-success/10 text-success" },
    { label: "Study Streak", value: loading ? "–" : `${analytics?.study_streak || 0} days`, icon: Flame, color: "bg-warning/10 text-warning" },
    { label: "Points Earned", value: "340", icon: Clock, color: "bg-accent/10 text-accent" },
  ];

  const quizData = (analytics?.quiz_scores || [0]).map((score, i) => ({
    quiz: `Q${i + 1}`,
    score
  }));

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m, i) => (
            <motion.div key={m.label} variants={fadeUp} custom={i} initial="hidden" animate="visible"
              className="glass-card p-5"
            >
              <div className={`rounded-lg p-2 w-fit mb-3 ${m.color}`}>
                <m.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold">{m.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div variants={fadeUp} custom={4} initial="hidden" animate="visible" className="glass-card p-6">
            <h3 className="font-semibold mb-4 text-sm">Learning Velocity</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lessonsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={chartStyle} />
                  <Area type="monotone" dataKey="lessons" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={5} initial="hidden" animate="visible" className="glass-card p-6">
            <h3 className="font-semibold mb-4 text-sm">Quiz Performance</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={quizData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="quiz" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={chartStyle} />
                  <Line type="monotone" dataKey="score" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ fill: "hsl(var(--accent))", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={6} initial="hidden" animate="visible" className="glass-card p-6 lg:col-span-2">
            <h3 className="font-semibold mb-4 text-sm">Study Time Distribution (Daily Avg)</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={streakData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={chartStyle} />
                  <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
