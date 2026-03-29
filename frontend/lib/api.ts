import axios from "axios";
import { getToken, removeToken } from "./auth";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      if (typeof window !== "undefined") window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ─── Auth ──────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) => api.post("/auth/login", { email, password }),
  register: (data: { name: string; email: string; password: string; role?: string }) => api.post("/auth/register", data),
  getMe: () => api.get("/auth/me"),
};

// ─── Semesters ─────────────────────────────────────────────────
export const semestersApi = {
  getAll: () => api.get("/semesters"),
  create: (data: Record<string, unknown>) => api.post("/semesters", data),
};

// ─── Courses ───────────────────────────────────────────────────
export const coursesApi = {
  getAll: (params?: Record<string, unknown>) => api.get("/courses", { params }),
  getById: (id: number) => api.get(`/courses/${id}`),
  create: (data: Record<string, unknown>) => api.post("/courses", data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/courses/${id}`, data),
  delete: (id: number) => api.delete(`/courses/${id}`),
};

// ─── Sections ──────────────────────────────────────────────────
export const sectionsApi = {
  getAll: (params?: Record<string, unknown>) => api.get("/sections", { params }),
  getById: (id: number) => api.get(`/sections/${id}`),
  create: (data: Record<string, unknown>) => api.post("/sections", data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/sections/${id}`, data),
  delete: (id: number) => api.delete(`/sections/${id}`),
  getOfferings: (sectionId: number) => api.get(`/sections/${sectionId}/offerings`),
  createOffering: (sectionId: number, data: Record<string, unknown>) => api.post(`/sections/${sectionId}/offerings`, data),
};

// ─── Timetable ─────────────────────────────────────────────────
export const timetableApi = {
  get: (params?: Record<string, unknown>) => api.get("/timetable", { params }),
  autoSchedule: (data?: Record<string, unknown>) => api.post("/timetable/auto-schedule", data || {}),
};

// ─── Change Requests ───────────────────────────────────────────
export const changeRequestsApi = {
  getAll: (params?: Record<string, unknown>) => api.get("/change-requests", { params }),
  getById: (id: number) => api.get(`/change-requests/${id}`),
  create: (data: Record<string, unknown>) => api.post("/change-requests", data),
  resolve: (id: number, data: { status: string; adminNote?: string }) => api.patch(`/change-requests/${id}`, data),
  checkConflict: (id: number) => api.get(`/change-requests/${id}/check-conflict`),
  getAlternatives: (id: number) => api.get(`/change-requests/${id}/alternatives`),
};

// ─── Resources ─────────────────────────────────────────────────
export const resourcesApi = {
  getAll: (params?: Record<string, unknown>) => api.get("/resources", { params }),
  getById: (id: number) => api.get(`/resources/${id}`),
  create: (data: Record<string, unknown>) => api.post("/resources", data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/resources/${id}`, data),
  delete: (id: number) => api.delete(`/resources/${id}`),
  getAvailability: (params?: Record<string, unknown>) => api.get("/resources/availability", { params }),
  getPoolState: () => api.get("/resources/pool-state"),
};

// ─── Dashboard ─────────────────────────────────────────────────
export const dashboardApi = {
  get: () => api.get("/dashboard"),
};

// ─── Notifications ─────────────────────────────────────────────
export const notificationsApi = {
  getAll: (params?: Record<string, unknown>) => api.get("/notifications", { params }),
  create: (data: Record<string, unknown>) => api.post("/notifications", data),
  markRead: (id: number) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/read-all"),
};

// ─── OS Concept APIs (kept for /os/ pages) ─────────────────────
export const schedulingApi = {
  run: (data: { algorithm: string; processes: unknown[]; quantum?: number }) => api.post("/scheduling/run", data),
  compare: (data: { algorithms: string[]; processes: unknown[] }) => api.post("/scheduling/compare", data),
  getMetrics: () => api.get("/scheduling/metrics"),
};

export const deadlockApi = {
  getRAG: () => api.get("/deadlock/rag"),
  analyze: () => api.post("/deadlock/analyze"),
  runBankers: (data: Record<string, unknown>) => api.post("/deadlock/bankers", data),
  createScenario: (data: Record<string, unknown>) => api.post("/deadlock/scenario", data),
  resolve: (data: { strategy: string }) => api.post("/deadlock/resolve", data),
};

export const concurrencyApi = {
  getSemaphores: () => api.get("/concurrency/semaphores"),
  simulate: (data: Record<string, unknown>) => api.post("/concurrency/simulate", data),
  getMutexes: () => api.get("/concurrency/mutexes"),
  raceDemo: (data: Record<string, unknown>) => api.post("/concurrency/race-demo", data),
};

export const bookingsApi = {
  getAll: (params?: Record<string, unknown>) => api.get("/bookings", { params }),
  getById: (id: number) => api.get(`/bookings/${id}`),
  create: (data: Record<string, unknown>) => api.post("/bookings", data),
  getQueue: () => api.get("/bookings/queue"),
  updateState: (id: number, state: string) => api.patch(`/bookings/${id}/state`, { state }),
};

export const analyticsApi = {
  getUtilization: (params?: Record<string, unknown>) => api.get("/analytics/utilization", { params }),
  getAlgorithms: () => api.get("/analytics/algorithms"),
  getHeatmap: (params?: Record<string, unknown>) => api.get("/analytics/heatmap", { params }),
  getFacultyLoad: (params?: Record<string, unknown>) => api.get("/analytics/faculty-load", { params }),
  getFragmentation: () => api.get("/analytics/fragmentation"),
};

export default api;
