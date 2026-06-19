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

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";

const AppContent = () => {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      api.setToken(session?.access_token || null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      api.setToken(session?.access_token || null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
