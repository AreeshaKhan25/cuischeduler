import axios from "axios";
import { getToken, removeToken } from "./auth";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ──────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post("/auth/register", data),
  getMe: () => api.get("/auth/me"),
};

// ─── Resources ─────────────────────────────────────────────────
export const resourcesApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get("/resources", { params }),
  getById: (id: number) => api.get(`/resources/${id}`),
  create: (data: Record<string, unknown>) => api.post("/resources", data),
  update: (id: number, data: Record<string, unknown>) =>
    api.put(`/resources/${id}`, data),
  delete: (id: number) => api.delete(`/resources/${id}`),
  getAvailability: (params?: Record<string, unknown>) =>
    api.get("/resources/availability", { params }),
  getPoolState: () => api.get("/resources/pool-state"),
};

// ─── Bookings ──────────────────────────────────────────────────
export const bookingsApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get("/bookings", { params }),
  getById: (id: number) => api.get(`/bookings/${id}`),
  create: (data: Record<string, unknown>) => api.post("/bookings", data),
  update: (id: number, data: Record<string, unknown>) =>
    api.put(`/bookings/${id}`, data),
  delete: (id: number) => api.delete(`/bookings/${id}`),
  getQueue: () => api.get("/bookings/queue"),
  updateState: (id: number, state: string) =>
    api.patch(`/bookings/${id}/state`, { state }),
};

// ─── Scheduling ────────────────────────────────────────────────
export const schedulingApi = {
  run: (data: { algorithm: string; processes: unknown[]; quantum?: number }) =>
    api.post("/scheduling/run", data),
  compare: (data: { algorithms: string[]; processes: unknown[] }) =>
    api.post("/scheduling/compare", data),
  getMetrics: () => api.get("/scheduling/metrics"),
};

// ─── Deadlock ──────────────────────────────────────────────────
export const deadlockApi = {
  getRAG: () => api.get("/deadlock/rag"),
  analyze: () => api.post("/deadlock/analyze"),
  runBankers: (data: Record<string, unknown>) =>
    api.post("/deadlock/bankers", data),
  createScenario: (data: Record<string, unknown>) =>
    api.post("/deadlock/scenario", data),
  resolve: (data: { strategy: string }) =>
    api.post("/deadlock/resolve", data),
};

// ─── Concurrency ───────────────────────────────────────────────
export const concurrencyApi = {
  getSemaphores: () => api.get("/concurrency/semaphores"),
  simulate: (data: Record<string, unknown>) =>
    api.post("/concurrency/simulate", data),
  getMutexes: () => api.get("/concurrency/mutexes"),
  raceDemo: (data: Record<string, unknown>) =>
    api.post("/concurrency/race-demo", data),
};

// ─── Timetable ─────────────────────────────────────────────────
export const timetableApi = {
  get: (params?: Record<string, unknown>) =>
    api.get("/timetable", { params }),
  create: (data: Record<string, unknown>) => api.post("/timetable", data),
  update: (id: number, data: Record<string, unknown>) =>
    api.put(`/timetable/${id}`, data),
  delete: (id: number) => api.delete(`/timetable/${id}`),
  autoSchedule: (data: Record<string, unknown>) =>
    api.post("/timetable/auto-schedule", data),
};

// ─── Analytics ─────────────────────────────────────────────────
export const analyticsApi = {
  getUtilization: (params?: Record<string, unknown>) =>
    api.get("/analytics/utilization", { params }),
  getAlgorithms: () => api.get("/analytics/algorithms"),
  getHeatmap: (params?: Record<string, unknown>) =>
    api.get("/analytics/heatmap", { params }),
  getFacultyLoad: (params?: Record<string, unknown>) =>
    api.get("/analytics/faculty-load", { params }),
  getFragmentation: () => api.get("/analytics/fragmentation"),
};

// ─── Notifications ─────────────────────────────────────────────
export const notificationsApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get("/notifications", { params }),
  create: (data: Record<string, unknown>) => api.post("/notifications", data),
  markRead: (id: number) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/read-all"),
  getQueueState: () => api.get("/notifications/queue-state"),
};

export default api;
