import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Flame, Trophy, TrendingUp, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/DashboardLayout";
import { ActivityCalendar } from "react-activity-calendar";
import { useTheme } from "next-themes";
import { subDays, format } from "date-fns";
import { api, Topic, Analytics } from "@/lib/api";

/**
 * Build the 365-day activity calendar from real backend calendar_data.
 * Each day gets count & level (0-4) based on actual lesson completions.
 */
const buildCalendarFromBackend = (calendarData?: { [date: string]: number }) => {
  const data = [];
  const today = new Date();
  for (let i = 365; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, "yyyy-MM-dd");
    const count = calendarData?.[dateStr] || 0;
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (count === 1) level = 1;
    else if (count === 2) level = 2;
    else if (count === 3) level = 3;
    else if (count >= 4) level = 4;
    data.push({ date: dateStr, count, level });
  }
  return data;
};

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } })
};

const Dashboard = () => {
  const { theme, systemTheme } = useTheme();
  const [userTopics, setUserTopics] = useState<Topic[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [topicsRes, analyticsRes] = await Promise.all([
          api.getTopics(),
          api.getAnalytics()
        ]);
        setUserTopics(topicsRes);
        setAnalytics(analyticsRes);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const resolvedTheme = theme === 'system' ? systemTheme : theme;
  const isDark = resolvedTheme === 'dark';

  const activityData = buildCalendarFromBackend(analytics?.calendar_data);

  const stats = [
    { label: "Topics Learning", value: loading ? "–" : userTopics.length.toString(), icon: BookOpen, color: "bg-primary/10 text-primary" },
    { label: "Lessons Completed", value: loading ? "–" : (analytics?.lessons_completed ?? 0).toString(), icon: TrendingUp, color: "bg-success/10 text-success" },
    { label: "Study Streak", value: loading ? "–" : `${analytics?.study_streak ?? 0} days`, icon: Flame, color: "bg-warning/10 text-warning" },
    { label: "Progress", value: loading ? "–" : `${Math.round(analytics?.progress_percentage ?? 0)}%`, icon: Trophy, color: "bg-accent/10 text-accent" },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} variants={fadeUp} custom={i} initial="hidden" animate="visible"
              className="glass-card p-5"
            >
              <div className={`rounded-lg p-2 w-fit mb-3 ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Continue Learning */}
        <motion.div variants={fadeUp} custom={4} initial="hidden" animate="visible">
          <h3 className="font-semibold mb-4">Continue Learning</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {userTopics.length > 0 ? (
              userTopics.map((t) => {
                const topicProgress = t.progress_percentage ?? 0;
                return (
                  <div key={t.id} className="glass-card p-5 hover-lift">
                    <h4 className="font-medium mb-3">{t.title}</h4>
                    <Progress value={topicProgress} className="h-2 mb-3" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{Math.round(topicProgress)}% Completed</span>
                      <Link to={`/roadmap/${t.id}`}>
                        <Button size="sm" variant="ghost" className="text-xs">
                          View Roadmap <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="md:col-span-3 glass-card p-8 text-center border-dashed border-2">
                <p className="text-muted-foreground mb-4">You haven't generated any topics yet.</p>
                <Link to="/topics">
                  <Button className="gradient-bg border-0 text-white">Generate Your First Topic</Button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Learning Contributions */}
        <motion.div variants={fadeUp} custom={5} initial="hidden" animate="visible"
          className="glass-card p-6 overflow-hidden"
        >
          <h3 className="font-semibold mb-6">Learning Contributions</h3>
          <div className="flex justify-center w-full overflow-x-auto pb-4">
            <div className="min-w-fit">
              <ActivityCalendar
                data={activityData}
                maxLevel={4}
                blockSize={14}
                blockRadius={2}
                blockMargin={4}
                colorScheme={isDark ? "dark" : "light"}
                theme={{
                  light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
                  dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
                }}
                labels={{
                  legend: {
                    less: "Less",
                    more: "More"
                  },
                  months: [
                    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                  ],
                  weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                  totalCount: '{{count}} lessons in the last year'
                }}
                renderBlock={(block, activity) => (
                  <div title={`${activity.count} lessons on ${activity.date}`}>
                    {block}
                  </div>
                )}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

