import { create } from "zustand";
import {
  BookingRequest,
  SchedulingResult,
  SchedulingAlgorithm,
  AlgorithmComparison,
} from "@/types";
import { bookingsApi, schedulingApi } from "@/lib/api";

interface SchedulerState {
  // Data
  bookingQueue: BookingRequest[];
  schedulingResult: SchedulingResult | null;
  comparison: AlgorithmComparison[] | null;

  // Settings
  selectedAlgorithm: SchedulingAlgorithm;
  quantum: number;
  agingEnabled: boolean;

  // UI
  isRunning: boolean;
  currentStep: number;

  // Actions
  fetchQueue: () => Promise<void>;
  addToQueue: (booking: BookingRequest) => void;
  removeFromQueue: (id: string) => void;
  runAlgorithm: () => Promise<void>;
  compareAll: () => Promise<void>;
  setAlgorithm: (algo: SchedulingAlgorithm) => void;
  setQuantum: (q: number) => void;
  setAging: (enabled: boolean) => void;
  reset: () => void;
  nextStep: () => void;
  setCurrentStep: (step: number) => void;
  loadDemoSet: () => void;
  addRandomBookings: (count: number) => void;
}

const DEMO_COURSES = [
  { code: "CS-301", name: "Operating Systems Lab" },
  { code: "CS-201", name: "OOP Lecture" },
  { code: "CS-401", name: "Database Systems" },
  { code: "CS-101", name: "Intro to Computing" },
  { code: "CS-501", name: "Machine Learning" },
  { code: "EE-201", name: "Digital Logic Design" },
  { code: "MT-301", name: "Linear Algebra" },
];

const RESOURCE_TYPES = ["classroom", "lab", "faculty", "exam_slot"] as const;

const FACULTIES = [
  "Dr. Ahmed Khan",
  "Dr. Sara Malik",
  "Prof. Usman Ali",
  "Dr. Fatima Noor",
  "Prof. Bilal Shah",
];

const PROCESS_COLORS = [
  "#4f8ef7",
  "#2dd4bf",
  "#f59e0b",
  "#c084fc",
  "#22c55e",
  "#ef4444",
  "#f97316",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

let pidCounter = 1000;

function generateBooking(overrides?: Partial<BookingRequest>): BookingRequest {
  const course = DEMO_COURSES[Math.floor(Math.random() * DEMO_COURSES.length)];
  const pid = pidCounter++;
  const duration = Math.floor(Math.random() * 7) * 15 + 30; // 30-120
  const priority = Math.floor(Math.random() * 10) + 1;
  const arrival = Math.floor(Math.random() * 20);
  const resourceType =
    RESOURCE_TYPES[Math.floor(Math.random() * RESOURCE_TYPES.length)];
  const faculty = FACULTIES[Math.floor(Math.random() * FACULTIES.length)];

  return {
    id: `bk-${pid}`,
    process_id: `P${pid}`,
    title: `${course.name} Session`,
    course_code: course.code,
    department: "Computer Science",
    faculty_id: `fac-${Math.floor(Math.random() * 5) + 1}`,
    resource_id: `res-${Math.floor(Math.random() * 20) + 1}`,
    resource_type: resourceType,
    requested_by: faculty,
    date: "2026-03-28",
    start_time: "09:00",
    end_time: "10:00",
    duration_minutes: duration,
    priority,
    state: "ready",
    arrival_time: arrival,
    waiting_time: 0,
    turnaround_time: 0,
    algorithm_used: "FCFS",
    os_concept_note: "Process in Ready Queue awaiting CPU dispatch",
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

export const useScheduler = create<SchedulerState>((set, get) => ({
  // Initial state
  bookingQueue: [],
  schedulingResult: null,
  comparison: null,
  selectedAlgorithm: "FCFS",
  quantum: 30,
  agingEnabled: false,
  isRunning: false,
  currentStep: 0,

  fetchQueue: async () => {
    try {
      const res = await bookingsApi.getQueue();
      const data = res.data?.data || res.data || [];
      set({ bookingQueue: Array.isArray(data) ? data : [] });
    } catch {
      // If API unavailable, keep current queue
    }
  },

  addToQueue: (booking) => {
    set((s) => ({ bookingQueue: [...s.bookingQueue, booking] }));
  },

  removeFromQueue: (id) => {
    set((s) => ({
      bookingQueue: s.bookingQueue.filter((b) => b.id !== id),
    }));
  },

  runAlgorithm: async () => {
    const { selectedAlgorithm, bookingQueue, quantum } = get();
    if (bookingQueue.length === 0) return;

    set({ isRunning: true, currentStep: 0, schedulingResult: null });

    try {
      const processes = bookingQueue.map((b) => ({
        id: b.id,
        process_id: b.process_id,
        title: b.title,
        burst_time: b.duration_minutes,
        priority: b.priority,
        arrival_time: b.arrival_time,
      }));

      const res = await schedulingApi.run({
        algorithm: selectedAlgorithm,
        processes,
        quantum: selectedAlgorithm === "RR" ? quantum : undefined,
      });

      set({
        schedulingResult: res.data?.data || res.data,
        isRunning: false,
      });
    } catch {
      // Generate client-side result as fallback
      const result = generateLocalResult(get);
      set({ schedulingResult: result, isRunning: false });
    }
  },

  compareAll: async () => {
    const { bookingQueue } = get();
    if (bookingQueue.length === 0) return;

    set({ isRunning: true });

    try {
      const processes = bookingQueue.map((b) => ({
        id: b.id,
        process_id: b.process_id,
        title: b.title,
        burst_time: b.duration_minutes,
        priority: b.priority,
        arrival_time: b.arrival_time,
      }));

      const res = await schedulingApi.compare({
        algorithms: ["FCFS", "SJF", "RR", "PRIORITY"],
        processes,
      });

      set({
        comparison: res.data?.data || res.data,
        isRunning: false,
      });
    } catch {
      // Fallback local comparison
      const comparison = generateLocalComparison(get);
      set({ comparison, isRunning: false });
    }
  },

  setAlgorithm: (algo) => {
    set({
      selectedAlgorithm: algo,
      schedulingResult: null,
      comparison: null,
      currentStep: 0,
    });
  },

  setQuantum: (q) => set({ quantum: q }),
  setAging: (enabled) => set({ agingEnabled: enabled }),

  reset: () => {
    set({
      bookingQueue: [],
      schedulingResult: null,
      comparison: null,
      currentStep: 0,
      isRunning: false,
    });
    pidCounter = 1000;
  },

  nextStep: () => {
    const { currentStep, schedulingResult } = get();
    if (schedulingResult && currentStep < schedulingResult.steps.length - 1) {
      set({ currentStep: currentStep + 1 });
    }
  },

  setCurrentStep: (step) => set({ currentStep: step }),

  loadDemoSet: () => {
    const demoBookings: BookingRequest[] = [
      generateBooking({
        title: "OS Lab Session",
        course_code: "CS-301",
        duration_minutes: 60,
        priority: 8,
        arrival_time: 0,
      }),
      generateBooking({
        title: "OOP Lecture",
        course_code: "CS-201",
        duration_minutes: 45,
        priority: 5,
        arrival_time: 2,
      }),
      generateBooking({
        title: "Database Workshop",
        course_code: "CS-401",
        duration_minutes: 90,
        priority: 3,
        arrival_time: 4,
      }),
      generateBooking({
        title: "ML Seminar",
        course_code: "CS-501",
        duration_minutes: 30,
        priority: 9,
        arrival_time: 1,
      }),
      generateBooking({
        title: "DLD Lab",
        course_code: "EE-201",
        duration_minutes: 75,
        priority: 6,
        arrival_time: 5,
      }),
    ];
    set({
      bookingQueue: demoBookings,
      schedulingResult: null,
      comparison: null,
      currentStep: 0,
    });
  },

  addRandomBookings: (count) => {
    const newBookings = Array.from({ length: count }, () => generateBooking());
    set((s) => ({
      bookingQueue: [...s.bookingQueue, ...newBookings],
      schedulingResult: null,
      comparison: null,
      currentStep: 0,
    }));
  },
}));

// ---------- Local fallback scheduling ----------

function generateLocalResult(
  get: () => SchedulerState
): SchedulingResult {
  const { selectedAlgorithm, bookingQueue, quantum } = get();
  let sorted = [...bookingQueue];

  switch (selectedAlgorithm) {
    case "SJF":
      sorted.sort((a, b) => a.duration_minutes - b.duration_minutes || a.arrival_time - b.arrival_time);
      break;
    case "PRIORITY":
      sorted.sort((a, b) => b.priority - a.priority || a.arrival_time - b.arrival_time);
      break;
    case "FCFS":
    default:
      sorted.sort((a, b) => a.arrival_time - b.arrival_time);
      break;
  }

  const steps: SchedulingResult["steps"] = [];
  const gantt: SchedulingResult["gantt_chart"] = [];
  let currentTime = 0;
  let stepNum = 0;
  let contextSwitches = 0;

  if (selectedAlgorithm === "RR") {
    // Round Robin simulation
    const remaining = sorted.map((b) => ({
      booking: b,
      remaining: b.duration_minutes,
    }));
    const completionTimes: Record<string, number> = {};
    const startTimes: Record<string, number> = {};

    while (remaining.some((r) => r.remaining > 0)) {
      for (const proc of remaining) {
        if (proc.remaining <= 0) continue;
        const execTime = Math.min(quantum, proc.remaining);
        if (!(proc.booking.process_id in startTimes)) {
          startTimes[proc.booking.process_id] = currentTime;
        }

        const colorIdx = sorted.indexOf(proc.booking) % PROCESS_COLORS.length;

        gantt.push({
          pid: proc.booking.process_id,
          label: proc.booking.title,
          start: currentTime,
          end: currentTime + execTime,
          color: PROCESS_COLORS[colorIdx],
        });

        const action =
          proc.remaining <= quantum
            ? "complete"
            : proc.remaining === proc.booking.duration_minutes
            ? "start"
            : "resume";

        steps.push({
          step_number: stepNum++,
          process_id: proc.booking.process_id,
          action: action as "start" | "complete" | "resume",
          time_unit: currentTime,
          reason:
            action === "complete"
              ? `${proc.booking.process_id} finishes execution`
              : `Quantum=${quantum}min allocated to ${proc.booking.process_id}`,
          os_concept_note:
            action === "complete"
              ? "Process transitions from Running to Completed state"
              : "Round Robin time quantum expiry triggers context switch",
          queue_snapshot: remaining
            .filter((r) => r.remaining > 0)
            .map((r) => ({
              pid: r.booking.process_id,
              burst: r.remaining,
              priority: r.booking.priority,
              state: r.booking.process_id === proc.booking.process_id ? "running" as const : "ready" as const,
            })),
          gantt_bar: {
            pid: proc.booking.process_id,
            start: currentTime,
            end: currentTime + execTime,
            color: PROCESS_COLORS[colorIdx],
          },
        });

        currentTime += execTime;
        proc.remaining -= execTime;

        if (proc.remaining <= 0) {
          completionTimes[proc.booking.process_id] = currentTime;
        } else {
          contextSwitches++;
          // Context switch step
          steps.push({
            step_number: stepNum++,
            process_id: proc.booking.process_id,
            action: "preempt",
            time_unit: currentTime,
            reason: `Time quantum expired for ${proc.booking.process_id}, context switch`,
            os_concept_note:
              "Context switch: save PCB state of current process, load next process from ready queue",
            queue_snapshot: remaining
              .filter((r) => r.remaining > 0)
              .map((r) => ({
                pid: r.booking.process_id,
                burst: r.remaining,
                priority: r.booking.priority,
                state: "ready" as const,
              })),
            gantt_bar: {
              pid: "SWITCH",
              start: currentTime,
              end: currentTime + 1,
              color: "#ef4444",
            },
          });
        }
      }
    }

    const totalWait = sorted.reduce((sum, b) => {
      const ct = completionTimes[b.process_id] || currentTime;
      return sum + (ct - b.arrival_time - b.duration_minutes);
    }, 0);
    const totalTurnaround = sorted.reduce((sum, b) => {
      const ct = completionTimes[b.process_id] || currentTime;
      return sum + (ct - b.arrival_time);
    }, 0);
    const n = sorted.length;

    return {
      algorithm: "RR",
      steps,
      gantt_chart: gantt,
      metrics: {
        avg_waiting_time: Math.max(0, Math.round((totalWait / n) * 100) / 100),
        avg_turnaround_time: Math.round((totalTurnaround / n) * 100) / 100,
        cpu_utilization: Math.round((sorted.reduce((s, b) => s + b.duration_minutes, 0) / currentTime) * 10000) / 100,
        throughput: Math.round((n / currentTime) * 10000) / 10000,
        context_switches: contextSwitches,
      },
      os_concept_summary:
        "Round Robin scheduling with time quantum provides fair CPU sharing. Each process gets equal time slices, preventing starvation at the cost of context switch overhead.",
    };
  }

  // FCFS / SJF / Priority - non-preemptive
  const completionTimes: Record<string, number> = {};

  sorted.forEach((booking, i) => {
    if (currentTime < booking.arrival_time) {
      currentTime = booking.arrival_time;
    }
    const colorIdx = i % PROCESS_COLORS.length;

    steps.push({
      step_number: stepNum++,
      process_id: booking.process_id,
      action: "start",
      time_unit: currentTime,
      reason: `${booking.process_id} dispatched (${
        selectedAlgorithm === "SJF"
          ? `shortest burst=${booking.duration_minutes}`
          : selectedAlgorithm === "PRIORITY"
          ? `highest priority=${booking.priority}`
          : `arrival_time=${booking.arrival_time}`
      })`,
      os_concept_note:
        selectedAlgorithm === "SJF"
          ? "SJF selects process with minimum burst time from ready queue"
          : selectedAlgorithm === "PRIORITY"
          ? "Priority scheduler selects highest-priority process from ready queue"
          : "FCFS dispatches process that arrived first in the ready queue",
      queue_snapshot: sorted.slice(i).map((b, j) => ({
        pid: b.process_id,
        burst: b.duration_minutes,
        priority: b.priority,
        state: j === 0 ? ("running" as const) : ("ready" as const),
      })),
      gantt_bar: {
        pid: booking.process_id,
        start: currentTime,
        end: currentTime + booking.duration_minutes,
        color: PROCESS_COLORS[colorIdx],
      },
    });

    gantt.push({
      pid: booking.process_id,
      label: booking.title,
      start: currentTime,
      end: currentTime + booking.duration_minutes,
      color: PROCESS_COLORS[colorIdx],
    });

    currentTime += booking.duration_minutes;
    completionTimes[booking.process_id] = currentTime;

    if (i < sorted.length - 1) {
      contextSwitches++;
    }

    steps.push({
      step_number: stepNum++,
      process_id: booking.process_id,
      action: "complete",
      time_unit: currentTime,
      reason: `${booking.process_id} execution complete at t=${currentTime}`,
      os_concept_note:
        "Process transitions to Completed state, PCB removed from ready queue",
      queue_snapshot: sorted.slice(i + 1).map((b) => ({
        pid: b.process_id,
        burst: b.duration_minutes,
        priority: b.priority,
        state: "ready" as const,
      })),
      gantt_bar: {
        pid: booking.process_id,
        start: currentTime - booking.duration_minutes,
        end: currentTime,
        color: PROCESS_COLORS[colorIdx],
      },
    });
  });

  const n = sorted.length;
  const totalWait = sorted.reduce((sum, b) => {
    const ct = completionTimes[b.process_id] || 0;
    return sum + Math.max(0, ct - b.arrival_time - b.duration_minutes);
  }, 0);
  const totalTurnaround = sorted.reduce((sum, b) => {
    const ct = completionTimes[b.process_id] || 0;
    return sum + (ct - b.arrival_time);
  }, 0);
  const totalBurst = sorted.reduce((s, b) => s + b.duration_minutes, 0);

  const descriptions: Record<string, string> = {
    FCFS: "FCFS processes requests in arrival order. Simple but may cause convoy effect where short processes wait behind long ones.",
    SJF: "SJF minimizes average waiting time by selecting shortest burst first. Optimal for non-preemptive scheduling but requires burst prediction.",
    PRIORITY:
      "Priority scheduling runs highest-priority processes first. Risk of starvation for low-priority processes, mitigated by aging.",
  };

  return {
    algorithm: selectedAlgorithm,
    steps,
    gantt_chart: gantt,
    metrics: {
      avg_waiting_time: Math.round((totalWait / n) * 100) / 100,
      avg_turnaround_time: Math.round((totalTurnaround / n) * 100) / 100,
      cpu_utilization: Math.round((totalBurst / currentTime) * 10000) / 100,
      throughput: Math.round((n / currentTime) * 10000) / 10000,
      context_switches: contextSwitches,
    },
    os_concept_summary: descriptions[selectedAlgorithm] || descriptions.FCFS,
  };
}

function generateLocalComparison(
  get: () => SchedulerState
): AlgorithmComparison[] {
  const { bookingQueue } = get();
  const n = bookingQueue.length;
  if (n === 0) return [];

  const totalBurst = bookingQueue.reduce(
    (s, b) => s + b.duration_minutes,
    0
  );

  // Simulate each algorithm
  const algorithms: SchedulingAlgorithm[] = ["FCFS", "SJF", "RR", "PRIORITY"];

  return algorithms.map((algo) => {
    let sorted = [...bookingQueue];
    let avgWait = 0;
    let avgTurnaround = 0;
    let ctxSwitches = 0;

    switch (algo) {
      case "SJF":
        sorted.sort((a, b) => a.duration_minutes - b.duration_minutes);
        break;
      case "PRIORITY":
        sorted.sort((a, b) => b.priority - a.priority);
        break;
      case "FCFS":
        sorted.sort((a, b) => a.arrival_time - b.arrival_time);
        break;
    }

    if (algo === "RR") {
      // Approximate RR metrics
      const q = get().quantum;
      const avgBurst = totalBurst / n;
      ctxSwitches = Math.floor(totalBurst / q);
      avgWait = Math.round(((n - 1) * q) / 2);
      avgTurnaround = avgWait + Math.round(avgBurst);
    } else {
      let time = 0;
      let totalWait = 0;
      let totalTA = 0;
      sorted.forEach((b) => {
        if (time < b.arrival_time) time = b.arrival_time;
        const wait = Math.max(0, time - b.arrival_time);
        totalWait += wait;
        time += b.duration_minutes;
        totalTA += time - b.arrival_time;
      });
      avgWait = Math.round((totalWait / n) * 100) / 100;
      avgTurnaround = Math.round((totalTA / n) * 100) / 100;
      ctxSwitches = n - 1;
    }

    const totalTime = algo === "RR" ? totalBurst + ctxSwitches : sorted.reduce((t, b, i) => {
      if (i === 0) return b.arrival_time + b.duration_minutes;
      return Math.max(t, b.arrival_time) + b.duration_minutes;
    }, 0);

    const cpuUtil = Math.round((totalBurst / Math.max(totalTime, 1)) * 10000) / 100;

    const bestFor: Record<string, string> = {
      FCFS: "Simple batch processing, no starvation",
      SJF: "Minimum average waiting time",
      RR: "Interactive, fair time-sharing",
      PRIORITY: "Differentiated service levels",
    };

    return {
      algorithm: algo,
      avg_waiting_time: avgWait,
      avg_turnaround_time: avgTurnaround,
      cpu_utilization: Math.min(cpuUtil, 100),
      throughput: Math.round((n / Math.max(totalTime, 1)) * 10000) / 10000,
      context_switches: ctxSwitches,
      best_for: bestFor[algo],
    };
  });
}

export { generateBooking };
export default useScheduler;
