import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import TopicGenerator from "./pages/TopicGenerator";
import TopicsList from "./pages/TopicsList";
import LessonReader from "./pages/LessonReader";
import AiTutor from "./pages/AiTutor";
import Quiz from "./pages/Quiz";
import RoadmapView from "./pages/RoadmapView";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

import { ThemeProvider } from "./components/ThemeProvider";
import { BackgroundTasksProvider } from "./context/BackgroundTasksContext";

const queryClient = new QueryClient();

import { useEffect, useState } from "react";
import { supabase, initSupabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

const AppContent = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    let subscription: any = null;

    const setup = async () => {
      await initSupabase();
      if (!active) return;

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!active) return;
        api.setToken(session?.access_token || null);
      });

      const {
        data: { subscription: sub },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) return;
        api.setToken(session?.access_token || null);
      });

      subscription = sub;
      setReady(true);
    };

    setup();

    return () => {
      active = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0a1c]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/topics" element={<TopicsList />} />
      <Route path="/lesson/:lessonId" element={<LessonReader />} />
      <Route path="/tutor" element={<AiTutor />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/roadmap" element={<TopicGenerator />} />
      <Route path="/roadmap/:topicId" element={<RoadmapView />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <ThemeProvider defaultTheme="system" enableSystem attribute="class">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <BackgroundTasksProvider>
            <AppContent />
          </BackgroundTasksProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
