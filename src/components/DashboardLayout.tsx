import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, MessageSquare, HelpCircle,
  Network, BarChart3, Settings, Zap, LogOut,
  X, Loader2, Sparkles, Clock, CheckCircle2, XCircle, Trash2
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useBackgroundTasks } from "@/context/BackgroundTasksContext";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Topics", url: "/topics", icon: BookOpen },
  { title: "Roadmap", url: "/roadmap", icon: Network },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { tasks, removeTask, clearCompletedTasks, hasActiveTasks } = useBackgroundTasks();
  const activeTasks = tasks.filter(t => t.status === "PENDING" || t.status === "STARTED");
  const completedTasks = tasks.filter(t => t.status === "SUCCESS" || t.status === "FAILURE");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar collapsible="icon">
          <SidebarContent className="pt-4">
            <div className="px-4 pb-4 flex items-center gap-2">
              <div className="gradient-bg rounded-lg p-1 shrink-0">
                <img src="/logo.png?v=3" alt="Logo" className="h-5 w-5 object-contain" />
              </div>
              <span className="font-bold text-sm group-data-[collapsible=icon]:hidden bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">Xynova.ai</span>
            </div>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => {
                    const active = item.url === "/roadmap" 
                      ? location.pathname.startsWith("/roadmap")
                      : location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <Link
                            to={item.url}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                              active
                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                          >
                            <item.icon className="h-4 w-4 shrink-0" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <div className="mt-auto px-3 pb-4">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Log Out</span>
              </button>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-background/80 backdrop-blur-md sticky top-0 z-40">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4" />
              <h2 className="font-semibold text-sm truncate">
                {navItems.find(i => i.url === location.pathname)?.title || "Xynova.ai"}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {/* Background Tasks Indicator */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl hover:bg-muted">
                    {hasActiveTasks ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-muted-foreground" />
                    )}
                    {activeTasks.length > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground shadow-sm">
                        {activeTasks.length}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 rounded-2xl border-border bg-popover/95 backdrop-blur-xl shadow-2xl z-50" align="end">
                  <div className="flex items-center justify-between border-b border-border/50 p-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <h4 className="font-bold text-sm">Background Tasks</h4>
                    </div>
                    {completedTasks.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearCompletedTasks} className="h-8 px-2 text-xs font-bold text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3 w-3 mr-1" /> Clear
                      </Button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto p-2 space-y-1">
                    {tasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                        <Clock className="h-8 w-8 text-muted-foreground/45" />
                        <p className="text-xs text-muted-foreground font-medium">No background tasks</p>
                      </div>
                    ) : (
                      tasks.map((task) => (
                        <div key={task.taskId} className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-muted/50 border border-transparent transition-all">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="shrink-0">
                              {task.status === "PENDING" || task.status === "STARTED" ? (
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              ) : task.status === "SUCCESS" ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-destructive" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold truncate">{task.topicName}</p>
                              <p className="text-[10px] text-muted-foreground font-medium capitalize mt-0.5">
                                {task.status === "STARTED" || task.status === "PENDING" ? "Generating..." : task.status.toLowerCase()}
                              </p>
                            </div>
                          </div>
                          <div className="shrink-0 flex items-center gap-1.5">
                            {task.status === "SUCCESS" && task.result?.topic_id && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2.5 text-[10px] font-bold rounded-lg border-primary/20 hover:bg-primary/10 hover:text-primary transition-all"
                                onClick={() => navigate(`/roadmap/${task.result?.topic_id}`)}
                              >
                                View
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => removeTask(task.taskId)}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
