import { create } from "zustand";
import { SemaphoreState, MutexState } from "@/types";
import { concurrencyApi } from "@/lib/api";

interface SimulationLogEntry {
  id: string;
  timestamp: number;
  operation: "SEM_WAIT" | "SEM_SIGNAL" | "MUTEX_LOCK" | "MUTEX_UNLOCK" | "READ" | "WRITE";
  process: string;
  resource: string;
  countChange: string;
  result: "GRANTED" | "BLOCKED" | "RELEASED" | "ERROR";
  osNote: string;
}

interface RaceDemoResult {
  withoutLock: RaceDemoStep[];
  withLock: RaceDemoStep[];
}

interface RaceDemoStep {
  step: number;
  process: string;
  action: string;
  sharedValue: string;
  result: string;
  isCritical: boolean;
}

interface ConcurrencyState {
  semaphores: SemaphoreState[];
  mutexes: MutexState[];
  simulationLog: SimulationLogEntry[];
  raceDemo: RaceDemoResult | null;
  isSimulating: boolean;
  concurrentCount: number;
  selectedResource: string;

  // Actions
  fetchSemaphores: () => Promise<void>;
  fetchMutexes: () => Promise<void>;
  simulate: (resourceId: string, count: number) => Promise<void>;
  runRaceDemo: () => Promise<void>;
  setConcurrentCount: (count: number) => void;
  setSelectedResource: (id: string) => void;
  addLogEntry: (entry: SimulationLogEntry) => void;
  reset: () => void;
}

// ─── Mock Data Generators ─────────────────────────────────────

function generateMockSemaphores(): SemaphoreState[] {
  return [
    {
      id: "sem-1",
      resource_name: "CS-101 Classroom",
      count: 1,
      max_count: 3,
      wait_queue: [
        { process_id: "P3", waiting_since: Date.now() - 5000 },
        { process_id: "P5", waiting_since: Date.now() - 2000 },
      ],
      history: [
        { time: 1, action: "wait", pid: "P1", count_after: 2, os_note: "P1 enters critical section, count decremented" },
        { time: 2, action: "wait", pid: "P2", count_after: 1, os_note: "P2 enters critical section, count decremented" },
        { time: 3, action: "wait", pid: "P4", count_after: 0, os_note: "P4 enters, semaphore count now 0" },
        { time: 4, action: "wait", pid: "P3", count_after: -1, os_note: "P3 blocked — count < 0, added to wait queue" },
        { time: 5, action: "signal", pid: "P1", count_after: 0, os_note: "P1 exits, signal wakes P3 from wait queue" },
        { time: 6, action: "wait", pid: "P5", count_after: -1, os_note: "P5 blocked — count < 0, added to wait queue" },
      ],
    },
    {
      id: "sem-2",
      resource_name: "Lab-A Workstations",
      count: 3,
      max_count: 5,
      wait_queue: [],
      history: [
        { time: 1, action: "wait", pid: "P1", count_after: 4, os_note: "P1 acquires workstation, count decremented" },
        { time: 2, action: "wait", pid: "P2", count_after: 3, os_note: "P2 acquires workstation" },
        { time: 3, action: "signal", pid: "P1", count_after: 4, os_note: "P1 releases workstation" },
      ],
    },
  ];
}

function generateMockMutexes(): MutexState[] {
  return [
    {
      id: "mtx-1",
      resource_name: "Exam Hall Schedule",
      locked: true,
      owner_pid: "P2",
      wait_queue: ["P4", "P6"],
    },
    {
      id: "mtx-2",
      resource_name: "Faculty Assignment DB",
      locked: false,
      owner_pid: null,
      wait_queue: [],
    },
    {
      id: "mtx-3",
      resource_name: "Timetable Editor",
      locked: true,
      owner_pid: "P1",
      wait_queue: ["P3"],
    },
  ];
}

function generateRaceDemo(): RaceDemoResult {
  return {
    withoutLock: [
      { step: 1, process: "P1", action: "READ room_status", sharedValue: "FREE", result: "room_status = FREE", isCritical: false },
      { step: 2, process: "P2", action: "READ room_status", sharedValue: "FREE", result: "room_status = FREE", isCritical: true },
      { step: 3, process: "P1", action: 'IF status == "FREE"', sharedValue: "FREE", result: "condition TRUE", isCritical: false },
      { step: 4, process: "P1", action: "WRITE room_status = BOOKED", sharedValue: "BOOKED", result: "P1 books room", isCritical: false },
      { step: 5, process: "P2", action: 'IF status == "FREE"', sharedValue: "BOOKED", result: "uses STALE read!", isCritical: true },
      { step: 6, process: "P2", action: "WRITE room_status = BOOKED", sharedValue: "BOOKED", result: "DOUBLE BOOKING!", isCritical: true },
    ],
    withLock: [
      { step: 1, process: "P1", action: "sem_wait(mutex)", sharedValue: "count: 1->0", result: "P1 ENTERS critical section", isCritical: false },
      { step: 2, process: "P2", action: "sem_wait(mutex)", sharedValue: "count: 0->-1", result: "P2 BLOCKED (queued)", isCritical: false },
      { step: 3, process: "P1", action: "READ room_status", sharedValue: "FREE", result: "room_status = FREE", isCritical: false },
      { step: 4, process: "P1", action: "WRITE room_status = BOOKED", sharedValue: "BOOKED", result: "P1 books room", isCritical: false },
      { step: 5, process: "P1", action: "sem_signal(mutex)", sharedValue: "count: -1->0", result: "P1 EXITS, wakes P2", isCritical: false },
      { step: 6, process: "P2", action: "READ room_status", sharedValue: "BOOKED", result: "room_status = BOOKED", isCritical: false },
      { step: 7, process: "P2", action: 'IF status == "FREE"', sharedValue: "BOOKED", result: "condition FALSE -- CORRECT", isCritical: false },
    ],
  };
}

function generateSimulationLog(resourceName: string, count: number): SimulationLogEntry[] {
  const entries: SimulationLogEntry[] = [];
  const processes = Array.from({ length: count }, (_, i) => `P${i + 1}`);
  let semCount = 1;
  let time = Date.now();

  for (const proc of processes) {
    const granted = semCount > 0;
    entries.push({
      id: `log-${entries.length}`,
      timestamp: time,
      operation: "SEM_WAIT",
      process: proc,
      resource: resourceName,
      countChange: `${semCount} -> ${granted ? semCount - 1 : semCount - 1}`,
      result: granted ? "GRANTED" : "BLOCKED",
      osNote: granted
        ? `${proc} enters critical section, semaphore decremented`
        : `${proc} blocked -- count became negative, added to wait queue`,
    });
    if (granted) semCount--;
    time += 500;
  }

  // Release some
  for (let i = 0; i < Math.min(2, processes.length); i++) {
    semCount++;
    entries.push({
      id: `log-${entries.length}`,
      timestamp: time,
      operation: "SEM_SIGNAL",
      process: processes[i],
      resource: resourceName,
      countChange: `${semCount - 1} -> ${semCount}`,
      result: "RELEASED",
      osNote: `${processes[i]} exits critical section, semaphore incremented, next waiter unblocked`,
    });
    time += 500;
  }

  return entries;
}

export const useConcurrency = create<ConcurrencyState>((set, get) => ({
  semaphores: [],
  mutexes: [],
  simulationLog: [],
  raceDemo: null,
  isSimulating: false,
  concurrentCount: 4,
  selectedResource: "sem-1",

  fetchSemaphores: async () => {
    try {
      const res = await concurrencyApi.getSemaphores();
      const data = res.data?.data || res.data;
      set({ semaphores: Array.isArray(data) ? data : [] });
    } catch {
      set({ semaphores: generateMockSemaphores() });
    }
  },

  fetchMutexes: async () => {
    try {
      const res = await concurrencyApi.getMutexes();
      const data = res.data?.data || res.data;
      set({ mutexes: Array.isArray(data) ? data : [] });
    } catch {
      set({ mutexes: generateMockMutexes() });
    }
  },

  simulate: async (resourceId: string, count: number) => {
    set({ isSimulating: true, simulationLog: [] });
    try {
      const res = await concurrencyApi.simulate({ resource_id: resourceId, concurrent_requests: count });
      const data = res.data?.data || res.data;
      set({
        simulationLog: data.log || [],
        semaphores: data.semaphores || get().semaphores,
        isSimulating: false,
      });
    } catch {
      // Local simulation
      const sem = get().semaphores.find((s) => s.id === resourceId);
      const resourceName = sem?.resource_name || "Resource";
      const log = generateSimulationLog(resourceName, count);

      // Animate log entries over time
      set({ isSimulating: true });
      const addEntries = async () => {
        for (let i = 0; i < log.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 400));
          set((s) => ({
            simulationLog: [...s.simulationLog, log[i]],
          }));
        }
        set({ isSimulating: false });
      };
      addEntries();
    }
  },

  runRaceDemo: async () => {
    set({ isSimulating: true, raceDemo: null });
    try {
      const res = await concurrencyApi.raceDemo({});
      const data = res.data?.data || res.data;
      set({ raceDemo: data, isSimulating: false });
    } catch {
      // Use local demo data
      await new Promise((resolve) => setTimeout(resolve, 600));
      set({ raceDemo: generateRaceDemo(), isSimulating: false });
    }
  },

  setConcurrentCount: (count) => set({ concurrentCount: count }),
  setSelectedResource: (id) => set({ selectedResource: id }),

  addLogEntry: (entry) => {
    set((s) => ({
      simulationLog: [...s.simulationLog, entry],
    }));
  },

  reset: () => {
    set({
      simulationLog: [],
      raceDemo: null,
      isSimulating: false,
      concurrentCount: 4,
    });
  },
}));

export default useConcurrency;
