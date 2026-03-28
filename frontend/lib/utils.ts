import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(dateStr: string): string {
  try {
    const date = typeof dateStr === "string" ? parseISO(dateStr) : new Date(dateStr);
    return format(date, "hh:mm a");
  } catch {
    return dateStr;
  }
}

export function formatDate(dateStr: string): string {
  try {
    const date = typeof dateStr === "string" ? parseISO(dateStr) : new Date(dateStr);
    return format(date, "MMM dd, yyyy");
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    const date = typeof dateStr === "string" ? parseISO(dateStr) : new Date(dateStr);
    return format(date, "MMM dd, yyyy hh:mm a");
  } catch {
    return dateStr;
  }
}

export function formatRelativeTime(dateStr: string): string {
  try {
    const date = typeof dateStr === "string" ? parseISO(dateStr) : new Date(dateStr);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return dateStr;
  }
}

export const PROCESS_STATE_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  new: {
    bg: "bg-accent-blue-soft",
    text: "text-accent-blue",
    border: "border-accent-blue",
    dot: "#4f8ef7",
  },
  ready: {
    bg: "bg-warning-soft",
    text: "text-warning",
    border: "border-warning",
    dot: "#f59e0b",
  },
  running: {
    bg: "bg-success-soft",
    text: "text-success",
    border: "border-success",
    dot: "#22c55e",
  },
  waiting: {
    bg: "bg-accent-teal-soft",
    text: "text-accent-teal",
    border: "border-accent-teal",
    dot: "#2dd4bf",
  },
  completed: {
    bg: "bg-[#1a1a2e]",
    text: "text-text-secondary",
    border: "border-text-tertiary",
    dot: "#8892aa",
  },
  blocked: {
    bg: "bg-danger-soft",
    text: "text-danger",
    border: "border-danger",
    dot: "#ef4444",
  },
};

export function getProcessStateColor(state: string) {
  return PROCESS_STATE_COLORS[state.toLowerCase()] || PROCESS_STATE_COLORS.new;
}

export const ALGORITHM_COLORS: Record<string, { bg: string; text: string }> = {
  fcfs: { bg: "bg-accent-blue-soft", text: "text-accent-blue" },
  sjf: { bg: "bg-accent-teal-soft", text: "text-accent-teal" },
  rr: { bg: "bg-warning-soft", text: "text-warning" },
  priority: { bg: "bg-[#2d1a3e]", text: "text-[#c084fc]" },
  srtf: { bg: "bg-success-soft", text: "text-success" },
  edf: { bg: "bg-danger-soft", text: "text-danger" },
};

export function getAlgorithmColor(algorithm: string) {
  return ALGORITHM_COLORS[algorithm.toLowerCase()] || ALGORITHM_COLORS.fcfs;
}
