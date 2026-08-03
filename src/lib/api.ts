const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001/api/v1";
console.log("DEBUG: API_URL is", API_URL);

export type TaskStatus = "PENDING" | "SUCCESS" | "FAILURE";

export interface Analytics {
  lessons_completed: number;
  quiz_scores: number[];
  study_streak: number;
  progress_percentage: number;
  calendar_data?: { [date: string]: number };
}

export interface Lesson {
  id: number;
  topic_id: number;
  title: string;
  content: string;
  order_index: number;
}

export interface TaskResponse {
  task_id: string;
  status: string;
}

export interface LessonMetadata {
  id: number;
  title: string;
  is_completed: boolean;
}

export interface RoadmapUnit {
  title: string;
  lessons: (string | LessonMetadata)[];
}

export interface Roadmap {
  topic: string;
  units: RoadmapUnit[];
  roadmap_graph?: {
    nodes: any[];
    edges: any[];
  };
}

export interface Topic {
  id: number;
  title: string;
  created_at: string;
  progress_percentage?: number;
}

class ApiClient {
  private token: string | null = localStorage.getItem("token");

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }

  getToken() {
    return this.token;
  }


  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = {
      "Content-Type": "application/json",
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token likely expired or invalid
      this.setToken(null);
      if (window.location.pathname !== "/auth" && window.location.pathname !== "/") {
        window.location.href = "/auth";
      }
      const error = await response.json().catch(() => ({ detail: "Session expired. Please log in again." }));
      throw new Error(error.detail || "Unauthorized");
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Unknown error" }));
      throw new Error(error.detail || "API request failed");
    }

    return response.json();
  }

  // Auth is handled by Supabase directly
  // Token is synced via App.tsx using setToken

  // Roadmap
  async generateRoadmap(topic: string, file?: File | null): Promise<TaskResponse> {
    if (file) {
      const formData = new FormData();
      formData.append("topic", topic);
      formData.append("file", file);
      
      const response = await fetch(`${API_URL}/roadmap/generate-roadmap`, {
        method: "POST",
        body: formData,
        headers: {
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        }
      });
      
      if (response.status === 401) {
        this.setToken(null);
        window.location.href = "/auth";
        throw new Error("Unauthorized");
      }
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(error.detail || "API request failed");
      }
      return response.json();
    }

    return this.request("/roadmap/generate-roadmap", {
      method: "POST",
      body: JSON.stringify({ topic }),
    });
  }

  async getTopics(): Promise<Topic[]> {
    return this.request("/roadmap/");
  }

  async getRoadmap(topicId: number): Promise<Roadmap> {
    return this.request(`/roadmap/${topicId}`);
  }

  // Tasks
  async getTaskStatus(taskId: string): Promise<TaskResponse & { result?: any }> {
    return this.request(`/tasks/status/${taskId}`);
  }

  // Chat
  async sendMessage(topicId: number, message: string, lessonId?: number, history: any[] = []) {
    return this.request("/chat/", {
      method: "POST",
      body: JSON.stringify({
        topic_id: topicId,
        lesson_id: lessonId,
        user_message: message,
        history: history,
      }),
    });
  }

  async getChatHistory(topicId: number): Promise<any[]> {
    return this.request(`/chat/history/${topicId}`);
  }

  // Lessons
  async getLesson(lessonId: number): Promise<Lesson> {
    return this.request(`/lesson/${lessonId}`);
  }
  
  async generateLesson(lessonId: number): Promise<TaskResponse> {
    return this.request(`/lesson/generate-lesson/${lessonId}`, {
      method: "POST"
    });
  }

  async regenerateLesson(lessonId: number): Promise<Lesson> {
    return this.request(`/lesson/${lessonId}/regenerate`, {
      method: "POST"
    });
  }

  async updateRoadmapGraph(topicId: number, nodes: any[], edges: any[]): Promise<Topic> {
    return this.request(`/roadmap/${topicId}/graph`, {
      method: "PATCH",
      body: JSON.stringify({ roadmap_graph: { nodes, edges } }),
    });
  }

  async confirmRoadmap(topicId: number, nodes: any[], edges: any[]): Promise<{ message: string }> {
    return this.request(`/roadmap/${topicId}/confirm`, {
      method: "POST",
      body: JSON.stringify({ roadmap_graph: { nodes, edges } }),
    });
  }

  async markComplete(lessonId: number, completed: boolean): Promise<any> {
    return this.request(`/progress/mark-complete`, {
      method: "POST",
      body: JSON.stringify({ lesson_id: lessonId, completed }),
    });
  }

  async getAnalytics(): Promise<Analytics> {
    return this.request(`/analytics/`);
  }

  async deleteTopic(topicId: number): Promise<{ message: string }> {
    return this.request(`/roadmap/delete/${topicId}`, {
      method: "DELETE",
    });
  }
}

export const api = new ApiClient();
