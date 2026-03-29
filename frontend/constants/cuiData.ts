export const DEPARTMENTS = [
  "Computer Science",
  "Software Engineering",
  "Artificial Intelligence",
  "Electrical Engineering",
  "Computer Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Humanities",
  "Mathematics",
  "Physics",
  "Psychology",
] as const;

export const DEPARTMENT_COLORS: Record<string, string> = {
  "Computer Science": "#4f8ef7",
  "Software Engineering": "#2dd4bf",
  "Artificial Intelligence": "#c084fc",
  "Electrical Engineering": "#f59e0b",
  "Computer Engineering": "#fb923c",
  "Mechanical Engineering": "#ef4444",
  "Civil Engineering": "#8b5cf6",
  "Humanities": "#ec4899",
  "Mathematics": "#22c55e",
  "Physics": "#06b6d4",
  "Psychology": "#f43f5e",
};

export const BUILDINGS = [
  "Academic Block",
  "300 Block",
  "Civil Engineering Block",
  "500 Block",
  "Mechanical Engineering Block",
] as const;

export const PROGRAMS = ["BCS", "BSE", "BAI", "BCE", "BEE", "BME", "BCVE", "BPY"] as const;

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

export const TIME_SLOTS = [
  "08:30", "09:35", "10:40", "11:45",
  "13:20", "14:25", "15:30",
] as const;

export const TIME_SLOT_DETAILS = [
  { index: 0, start: "08:30", end: "09:25", label: "1" },
  { index: 1, start: "09:35", end: "10:30", label: "2" },
  { index: 2, start: "10:40", end: "11:35", label: "3" },
  { index: 3, start: "11:45", end: "12:40", label: "4" },
  // Lunch break: 12:40 - 13:20
  { index: 4, start: "13:20", end: "14:15", label: "5" },
  { index: 5, start: "14:25", end: "15:20", label: "6" },
  { index: 6, start: "15:30", end: "16:25", label: "7" },
] as const;

export const COURSE_COLORS: Record<string, string> = {
  "Computer Science": "#3b82f6",
  "Software Engineering": "#14b8a6",
  "Artificial Intelligence": "#a855f7",
  "Electrical Engineering": "#f59e0b",
  "Mathematics": "#22c55e",
  "Humanities": "#ec4899",
  "Physics": "#06b6d4",
  "General": "#6b7280",
};

// Status colors for change requests
export const REQUEST_STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: "#2d1f05", text: "#fcd34d", border: "#f59e0b" },
  approved: { bg: "#0a2e17", text: "#86efac", border: "#22c55e" },
  rejected: { bg: "#2d0a0a", text: "#fca5a5", border: "#ef4444" },
  conflict: { bg: "#2d1a05", text: "#fdba74", border: "#fb923c" },
};

export const PROCESS_STATE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  new: { bg: "#1a2f5e", text: "#93c5fd", border: "#3b82f6" },
  ready: { bg: "#0a2e17", text: "#86efac", border: "#22c55e" },
  running: { bg: "#0d2e2a", text: "#5eead4", border: "#2dd4bf" },
  waiting: { bg: "#2d1f05", text: "#fcd34d", border: "#f59e0b" },
  completed: { bg: "#1e2435", text: "#8892aa", border: "#3a4560" },
  blocked: { bg: "#2d0a0a", text: "#fca5a5", border: "#ef4444" },
};

export const ALGORITHM_COLORS: Record<string, string> = {
  FCFS: "#4f8ef7",
  SJF: "#2dd4bf",
  RR: "#f59e0b",
  PRIORITY: "#a855f7",
};

// OS concept mapping for secondary layer
export const FEATURE_OS_MAP: Record<string, { concept: string; description: string }> = {
  autoSchedule: {
    concept: "CPU Scheduling",
    description: "Constraint-based scheduling uses priority ordering similar to Priority CPU Scheduling (OS Ch.5)",
  },
  conflict: {
    concept: "Deadlock Detection",
    description: "Resource conflicts are analogous to deadlock in OS — two processes contending for the same resource (OS Ch.7)",
  },
  changeRequest: {
    concept: "Banker's Algorithm",
    description: "Change request approval checks resource availability like Banker's Algorithm ensures safe state (OS Ch.7)",
  },
  roomAllocation: {
    concept: "Memory Management",
    description: "Room allocation maps to memory allocation — fitting processes into available space (OS Ch.8)",
  },
  notification: {
    concept: "IPC Message Queue",
    description: "Notifications work like inter-process communication message queues (OS Ch.3)",
  },
};
