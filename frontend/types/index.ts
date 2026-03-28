export type ResourceType = 'classroom' | 'lab' | 'faculty' | 'exam_slot';
export type ResourceStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';
export type ProcessState = 'new' | 'ready' | 'running' | 'waiting' | 'completed' | 'blocked';
export type SchedulingAlgorithm = 'FCFS' | 'SJF' | 'RR' | 'PRIORITY';

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  building: string;
  floor: number;
  capacity: number;
  status: ResourceStatus;
  features: string[];
  department: string;
}

export interface BookingRequest {
  id: string;
  process_id: string;
  title: string;
  course_code: string;
  department: string;
  faculty_id: string;
  resource_id: string;
  resource_type: ResourceType;
  requested_by: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  priority: number;
  state: ProcessState;
  arrival_time: number;
  waiting_time: number;
  turnaround_time: number;
  algorithm_used: SchedulingAlgorithm;
  os_concept_note: string;
  created_at: string;
}

export interface SchedulingStep {
  step_number: number;
  process_id: string;
  action: 'start' | 'preempt' | 'resume' | 'complete' | 'wait' | 'age' | 'block';
  time_unit: number;
  reason: string;
  os_concept_note: string;
  queue_snapshot: { pid: string; burst: number; priority: number; state: ProcessState }[];
  gantt_bar: { pid: string; start: number; end: number; color: string };
}

export interface SchedulingResult {
  algorithm: SchedulingAlgorithm;
  steps: SchedulingStep[];
  gantt_chart: { pid: string; label: string; start: number; end: number; color: string }[];
  metrics: {
    avg_waiting_time: number;
    avg_turnaround_time: number;
    cpu_utilization: number;
    throughput: number;
    context_switches: number;
  };
  os_concept_summary: string;
}

export interface RAGNode {
  id: string;
  type: 'process' | 'resource';
  label: string;
  x: number;
  y: number;
  instances?: number;
  in_cycle: boolean;
}

export interface RAGEdge {
  id: string;
  source: string;
  target: string;
  type: 'assignment' | 'request';
  in_cycle: boolean;
}

export interface DeadlockAnalysis {
  has_deadlock: boolean;
  cycle_nodes: string[];
  cycle_description: string;
  banker_safe: boolean;
  safe_sequence: string[];
  banker_matrix: {
    processes: string[];
    resources: string[];
    max: number[][];
    allocation: number[][];
    need: number[][];
    available: number[];
    steps: { process: string; can_run: boolean; reason: string; available_after: number[] }[];
  };
  resolution_options: { action: string; target_process: string; description: string }[];
  os_concept_note: string;
}

export interface SemaphoreState {
  id: string;
  resource_name: string;
  count: number;
  max_count: number;
  wait_queue: { process_id: string; waiting_since: number }[];
  history: { time: number; action: 'wait' | 'signal'; pid: string; count_after: number; os_note: string }[];
}

export interface MutexState {
  id: string;
  resource_name: string;
  locked: boolean;
  owner_pid: string | null;
  wait_queue: string[];
}

export interface ResourcePoolState {
  total_slots: number;
  allocated_slots: number;
  free_slots: number;
  fragmentation_pct: number;
  bitmap: boolean[];
  allocation_map: { slot: number; booking_id: string; resource_name: string }[];
}

export interface IPCMessage {
  id: string;
  from_department: string;
  to_department: string;
  type: 'booking_confirmed' | 'conflict' | 'resource_freed' | 'exam_scheduled' | 'broadcast';
  subject: string;
  body: string;
  read: boolean;
  created_at: string;
  os_concept: string;
}

export interface AlgorithmComparison {
  algorithm: SchedulingAlgorithm;
  avg_waiting_time: number;
  avg_turnaround_time: number;
  cpu_utilization: number;
  throughput: number;
  context_switches: number;
  best_for: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'faculty' | 'student';
  department: string;
  created_at: string;
}

export interface TimetableEntry {
  id: string;
  booking_id: string;
  resource_id: string;
  resource_name: string;
  course_code: string;
  title: string;
  faculty_name: string;
  department: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  color: string;
}

export interface AnalyticsData {
  utilization: { resource_id: string; resource_name: string; utilization_pct: number }[];
  algorithm_comparison: AlgorithmComparison[];
  heatmap: number[][];
  faculty_load: { faculty_id: string; name: string; hours: number; max_hours: number }[];
  fragmentation_history: { date: string; fragmentation_pct: number }[];
}
