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

/* Actual CUI Wah Campus time slots (SP-26 timetable) */
export const TIME_SLOTS = [
  "08:30", "09:35", "10:40", "11:45",
  "13:20", "14:25", "15:30",
];
