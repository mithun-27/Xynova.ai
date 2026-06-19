import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api";

export interface BackgroundTask {
  taskId: string;
  topicName: string;
  status: "PENDING" | "STARTED" | "SUCCESS" | "FAILURE";
  result?: { topic_id?: number };
  error?: string;
  createdAt: number;
}

interface BackgroundTasksContextType {
  tasks: BackgroundTask[];
  addTask: (taskId: string, topicName: string) => void;
  removeTask: (taskId: string) => void;
  clearCompletedTasks: () => void;
  hasActiveTasks: boolean;
}

const BackgroundTasksContext = createContext<BackgroundTasksContextType | undefined>(undefined);

export const BackgroundTasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<BackgroundTask[]>([]);
  const navigate = useNavigate();

  // Load tasks from localStorage on initialization
  useEffect(() => {
    const saved = localStorage.getItem("xynova_background_tasks");
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse background tasks", e);
      }
    }
  }, []);

  // Poll active tasks
  useEffect(() => {
    const activeTasks = tasks.filter(t => t.status === "PENDING" || t.status === "STARTED");
    if (activeTasks.length === 0) return;

    let isMounted = true;
    const intervalId = setInterval(async () => {
      const updatedTasks = [...tasks];
      let changed = false;

      for (let i = 0; i < updatedTasks.length; i++) {
        const task = updatedTasks[i];
        if (task.status === "PENDING" || task.status === "STARTED") {
          try {
            const res = await api.getTaskStatus(task.taskId);
            if (res.status === "SUCCESS") {
              updatedTasks[i] = {
                ...task,
                status: "SUCCESS",
                result: res.result,
              };
              changed = true;
              
              const topicId = res.result?.topic_id;
              toast.success("Roadmap Complete", {
                description: `Your learning roadmap for "${task.topicName}" is ready!`,
                action: topicId ? {
                  label: "View",
                  onClick: () => navigate(`/roadmap/${topicId}`),
                } : undefined,
                duration: 10000,
              });
            } else if (res.status === "FAILURE") {
              updatedTasks[i] = {
                ...task,
                status: "FAILURE",
                error: res.result || "Generation failed",
              };
              changed = true;
              toast.error("Generation Failed", {
                description: `Could not generate roadmap for "${task.topicName}".`,
              });
            } else if (res.status !== task.status) {
              updatedTasks[i] = {
                ...task,
                status: res.status as any,
              };
              changed = true;
            }
          } catch (err) {
            console.error(`Failed to poll task ${task.taskId}`, err);
          }
        }
      }

      if (changed && isMounted) {
        setTasks(updatedTasks);
        localStorage.setItem("xynova_background_tasks", JSON.stringify(updatedTasks));
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [tasks, navigate]);

  const addTask = (taskId: string, topicName: string) => {
    const newTask: BackgroundTask = {
      taskId,
      topicName,
      status: "PENDING",
      createdAt: Date.now(),
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    localStorage.setItem("xynova_background_tasks", JSON.stringify(updated));
  };

  const removeTask = (taskId: string) => {
    const updated = tasks.filter(t => t.taskId !== taskId);
    setTasks(updated);
    localStorage.setItem("xynova_background_tasks", JSON.stringify(updated));
  };

  const clearCompletedTasks = () => {
    const updated = tasks.filter(t => t.status === "PENDING" || t.status === "STARTED");
    setTasks(updated);
    localStorage.setItem("xynova_background_tasks", JSON.stringify(updated));
  };

  const hasActiveTasks = tasks.some(t => t.status === "PENDING" || t.status === "STARTED");

  return (
    <BackgroundTasksContext.Provider value={{ tasks, addTask, removeTask, clearCompletedTasks, hasActiveTasks }}>
      {children}
    </BackgroundTasksContext.Provider>
  );
};

export const useBackgroundTasks = () => {
  const context = useContext(BackgroundTasksContext);
  if (!context) {
    throw new Error("useBackgroundTasks must be used within a BackgroundTasksProvider");
  }
  return context;
};
