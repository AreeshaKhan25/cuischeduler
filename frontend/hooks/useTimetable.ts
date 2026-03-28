import { create } from "zustand";
import { TimetableEntry } from "@/types";
import { timetableApi } from "@/lib/api";

interface DragState {
  isDragging: boolean;
  activeId: string | null;
  overId: string | null;
}

interface TimetableState {
  // Data
  entries: TimetableEntry[];

  // UI State
  currentWeek: Date;
  selectedDepartment: string;
  dragState: DragState;
  conflicts: { entryA: string; entryB: string; reason: string }[];

  // Loading
  isLoading: boolean;
  isAutoScheduling: boolean;

  // Actions
  fetchEntries: () => Promise<void>;
  createEntry: (entry: Omit<TimetableEntry, "id">) => Promise<void>;
  updateEntry: (id: string, updates: Partial<TimetableEntry>) => void;
  deleteEntry: (id: string) => Promise<void>;
  autoSchedule: (algorithm: string) => Promise<void>;
  setWeek: (date: Date) => void;
  setDepartment: (dept: string) => void;
  setDragState: (state: Partial<DragState>) => void;
  detectConflicts: () => void;
  moveEntry: (entryId: string, day: number, startTime: string) => void;
}

// ─── Mock Timetable Entries ────────────────────────────────────────
const MOCK_ENTRIES: TimetableEntry[] = [
  { id: "tt-1", booking_id: "b1", resource_id: "cs-101", resource_name: "CS Lab 1", course_code: "CSC301", title: "Operating Systems Lab", faculty_name: "Dr. Ahmed Khan", department: "Computer Science", day_of_week: 1, start_time: "08:00", end_time: "10:00", color: "#4f8ef7" },
  { id: "tt-2", booking_id: "b2", resource_id: "cs-201", resource_name: "Room 201", course_code: "CSC302", title: "Database Systems", faculty_name: "Dr. Fatima Noor", department: "Computer Science", day_of_week: 1, start_time: "10:00", end_time: "11:00", color: "#4f8ef7" },
  { id: "tt-3", booking_id: "b3", resource_id: "cs-301", resource_name: "AI Lab", course_code: "CSC401", title: "Artificial Intelligence", faculty_name: "Dr. Usman Tariq", department: "Computer Science", day_of_week: 1, start_time: "14:00", end_time: "16:00", color: "#4f8ef7" },
  { id: "tt-4", booking_id: "b4", resource_id: "ee-101", resource_name: "Circuits Lab", course_code: "EEE201", title: "Circuit Analysis Lab", faculty_name: "Dr. Hassan Ali", department: "Electrical Engineering", day_of_week: 1, start_time: "09:00", end_time: "11:00", color: "#f59e0b" },
  { id: "tt-5", booking_id: "b5", resource_id: "cs-202", resource_name: "Room 202", course_code: "SEN301", title: "Software Design", faculty_name: "Dr. Sara Malik", department: "Software Engineering", day_of_week: 2, start_time: "08:00", end_time: "10:00", color: "#2dd4bf" },
  { id: "tt-6", booking_id: "b6", resource_id: "cs-203", resource_name: "Room 203", course_code: "SEN302", title: "Software Testing", faculty_name: "Dr. Bilal Shah", department: "Software Engineering", day_of_week: 2, start_time: "10:00", end_time: "11:00", color: "#2dd4bf" },
  { id: "tt-7", booking_id: "b7", resource_id: "nb-101", resource_name: "Lecture Hall A", course_code: "MGT101", title: "Principles of Management", faculty_name: "Dr. Ayesha Rizwan", department: "Management Sciences", day_of_week: 2, start_time: "14:00", end_time: "16:00", color: "#a855f7" },
  { id: "tt-8", booking_id: "b8", resource_id: "cs-101", resource_name: "CS Lab 1", course_code: "CSC301", title: "Operating Systems Lab", faculty_name: "Dr. Ahmed Khan", department: "Computer Science", day_of_week: 3, start_time: "08:00", end_time: "10:00", color: "#4f8ef7" },
  { id: "tt-9", booking_id: "b9", resource_id: "ee-301", resource_name: "DSP Lab", course_code: "EEE301", title: "Digital Signal Processing", faculty_name: "Dr. Imran Sajid", department: "Electrical Engineering", day_of_week: 3, start_time: "10:00", end_time: "12:00", color: "#f59e0b" },
  { id: "tt-10", booking_id: "b10", resource_id: "nb-201", resource_name: "Room 201", course_code: "MTH201", title: "Linear Algebra", faculty_name: "Dr. Nadia Akram", department: "Mathematics", day_of_week: 3, start_time: "14:00", end_time: "15:00", color: "#22c55e" },
  { id: "tt-11", booking_id: "b11", resource_id: "cs-303", resource_name: "SE Lab", course_code: "SEN401", title: "DevOps Practices", faculty_name: "Dr. Bilal Shah", department: "Software Engineering", day_of_week: 4, start_time: "08:00", end_time: "10:00", color: "#2dd4bf" },
  { id: "tt-12", booking_id: "b12", resource_id: "cs-201", resource_name: "Room 201", course_code: "CSC302", title: "Database Systems", faculty_name: "Dr. Fatima Noor", department: "Computer Science", day_of_week: 4, start_time: "10:00", end_time: "12:00", color: "#4f8ef7" },
  { id: "tt-13", booking_id: "b13", resource_id: "nb-102", resource_name: "Lecture Hall B", course_code: "MGT201", title: "Business Analytics", faculty_name: "Dr. Ayesha Rizwan", department: "Management Sciences", day_of_week: 4, start_time: "14:00", end_time: "16:00", color: "#a855f7" },
  { id: "tt-14", booking_id: "b14", resource_id: "cs-301", resource_name: "AI Lab", course_code: "CSC401", title: "Artificial Intelligence", faculty_name: "Dr. Usman Tariq", department: "Computer Science", day_of_week: 5, start_time: "09:00", end_time: "11:00", color: "#4f8ef7" },
  { id: "tt-15", booking_id: "b15", resource_id: "ee-102", resource_name: "Power Lab", course_code: "EEE202", title: "Power Systems Lab", faculty_name: "Dr. Hassan Ali", department: "Electrical Engineering", day_of_week: 5, start_time: "11:00", end_time: "13:00", color: "#f59e0b" },
  { id: "tt-16", booking_id: "b16", resource_id: "nb-301", resource_name: "Computer Lab", course_code: "MTH301", title: "Numerical Methods", faculty_name: "Dr. Nadia Akram", department: "Mathematics", day_of_week: 5, start_time: "14:00", end_time: "16:00", color: "#22c55e" },
];

export const useTimetable = create<TimetableState>((set, get) => ({
  entries: [],
  currentWeek: new Date(),
  selectedDepartment: "all",
  dragState: { isDragging: false, activeId: null, overId: null },
  conflicts: [],
  isLoading: false,
  isAutoScheduling: false,

  fetchEntries: async () => {
    set({ isLoading: true });
    try {
      const res = await timetableApi.get({ department: get().selectedDepartment });
      set({ entries: res.data, isLoading: false });
    } catch {
      set({ entries: MOCK_ENTRIES, isLoading: false });
    }
    get().detectConflicts();
  },

  createEntry: async (entry) => {
    try {
      const res = await timetableApi.create(entry as unknown as Record<string, unknown>);
      set((s) => ({ entries: [...s.entries, res.data] }));
    } catch {
      const newEntry = { ...entry, id: `tt-${Date.now()}` } as TimetableEntry;
      set((s) => ({ entries: [...s.entries, newEntry] }));
    }
    get().detectConflicts();
  },

  updateEntry: (id, updates) => {
    set((s) => ({
      entries: s.entries.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
    get().detectConflicts();
  },

  deleteEntry: async (id) => {
    try {
      await timetableApi.delete(parseInt(id));
    } catch {
      // continue with local deletion
    }
    set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
    get().detectConflicts();
  },

  autoSchedule: async (algorithm) => {
    set({ isAutoScheduling: true });
    try {
      const res = await timetableApi.autoSchedule({ algorithm });
      set({ entries: res.data, isAutoScheduling: false });
    } catch {
      // Simulate auto-scheduling by shuffling times
      const hours = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
      set((s) => ({
        entries: s.entries.map((e) => {
          const newStart = hours[Math.floor(Math.random() * hours.length)];
          const startH = parseInt(newStart.split(":")[0]);
          const duration = parseInt(e.end_time.split(":")[0]) - parseInt(e.start_time.split(":")[0]);
          const endH = Math.min(startH + duration, 17);
          return {
            ...e,
            start_time: newStart,
            end_time: `${endH.toString().padStart(2, "0")}:00`,
          };
        }),
        isAutoScheduling: false,
      }));
    }
    get().detectConflicts();
  },

  setWeek: (date) => set({ currentWeek: date }),
  setDepartment: (dept) => set({ selectedDepartment: dept }),
  setDragState: (state) => set((s) => ({ dragState: { ...s.dragState, ...state } })),

  moveEntry: (entryId, day, startTime) => {
    const entry = get().entries.find((e) => e.id === entryId);
    if (!entry) return;
    const startH = parseInt(startTime.split(":")[0]);
    const duration = parseInt(entry.end_time.split(":")[0]) - parseInt(entry.start_time.split(":")[0]);
    const endH = Math.min(startH + duration, 17);
    get().updateEntry(entryId, {
      day_of_week: day,
      start_time: startTime,
      end_time: `${endH.toString().padStart(2, "0")}:00`,
    });
  },

  detectConflicts: () => {
    const entries = get().entries;
    const conflicts: { entryA: string; entryB: string; reason: string }[] = [];
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const a = entries[i];
        const b = entries[j];
        if (a.day_of_week !== b.day_of_week) continue;
        const aStart = parseInt(a.start_time.split(":")[0]);
        const aEnd = parseInt(a.end_time.split(":")[0]);
        const bStart = parseInt(b.start_time.split(":")[0]);
        const bEnd = parseInt(b.end_time.split(":")[0]);
        const overlaps = aStart < bEnd && bStart < aEnd;
        if (!overlaps) continue;

        if (a.resource_id === b.resource_id) {
          conflicts.push({
            entryA: a.id,
            entryB: b.id,
            reason: `Room conflict: ${a.resource_name} double-booked`,
          });
        }
        if (a.faculty_name === b.faculty_name) {
          conflicts.push({
            entryA: a.id,
            entryB: b.id,
            reason: `Faculty conflict: ${a.faculty_name} has overlapping classes`,
          });
        }
      }
    }
    set({ conflicts });
  },
}));

export default useTimetable;
