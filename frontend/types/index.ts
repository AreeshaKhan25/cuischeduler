// ─── Core Academic Types ─────────────────────────────────────────

export interface Semester {
  id: number;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  creditHours: number;
  isLab: boolean;
  isTechnical: boolean;
  department: string;
}

export interface Section {
  id: number;
  name: string;
  program: string;
  semester: number;
  strength: number;
  department: string;
}

export interface CourseOffering {
  id: number;
  semesterId: number;
  courseId: number;
  sectionId: number;
  facultyId: number | null;
  classesPerWeek: number;
  labsPerWeek: number;
  course?: Course;
  section?: Section;
  faculty?: User;
}

// ─── Timetable Types ─────────────────────────────────────────────

export interface TimetableEntry {
  id: number;
  courseOfferingId: number;
  resourceId: number;
  semesterId: number;
  dayOfWeek: string;
  slotIndex: number;
  startTime: string;
  endTime: string;
  isLab: boolean;
  courseOffering?: CourseOffering;
  resource?: Resource;
}

export interface TimetableCell {
  entry: TimetableEntry;
  courseName: string;
  courseCode: string;
  facultyName: string;
  roomName: string;
  sectionName: string;
  isLab: boolean;
  color: string;
}

// ─── Change Request Types ────────────────────────────────────────

export type ChangeRequestType = 'room_change' | 'time_change' | 'swap';
export type ChangeRequestStatus = 'pending' | 'approved' | 'rejected' | 'conflict';

export interface ChangeRequest {
  id: number;
  requestedById: number;
  semesterId: number;
  timetableEntryId: number | null;
  type: ChangeRequestType;
  currentDay: string | null;
  currentSlot: number | null;
  currentResourceId: number | null;
  requestedDay: string | null;
  requestedSlot: number | null;
  requestedResourceId: number | null;
  reason: string;
  status: ChangeRequestStatus;
  conflictDetails: string | null;
  suggestedAlternatives: string | null;
  adminNote: string | null;
  resolvedById: number | null;
  resolvedAt: string | null;
  createdAt: string;
  osConceptTag: string | null;
  requestedBy?: User;
  resolvedBy?: User;
  timetableEntry?: TimetableEntry;
}

export interface ConflictInfo {
  hasConflict: boolean;
  details: string;
  conflictingEntry?: TimetableEntry;
}

export interface AlternativeSuggestion {
  day: string;
  slotIndex: number;
  startTime: string;
  endTime: string;
  resourceId: number;
  resourceName: string;
  reason: string;
}

// ─── Auto-Scheduler Types ────────────────────────────────────────

export interface AutoScheduleResult {
  placed: number;
  failed: number;
  total: number;
  entries: TimetableEntry[];
  unplaceable: UnplaceableItem[];
  osNote: string;
}

export interface UnplaceableItem {
  courseOfferingId: number;
  courseName: string;
  sectionName: string;
  reason: string;
}

// ─── User & Resource Types ───────────────────────────────────────

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'faculty' | 'student';
  department: string;
  sectionId: number | null;
  createdAt: string;
}

export interface Resource {
  id: number;
  name: string;
  type: 'classroom' | 'lab';
  building: string;
  floor: number;
  capacity: number;
  status: string;
  features: string;
  department: string;
}

export interface Notification {
  id: number;
  userId: number | null;
  type: string;
  subject: string;
  body: string;
  read: boolean;
  createdAt: string;
}

// ─── Dashboard Types ─────────────────────────────────────────────

export interface DashboardStats {
  totalSections: number;
  totalCourses: number;
  scheduledClasses: number;
  roomUtilization: number;
  pendingRequests: number;
  conflicts: number;
}

// ─── OS Concept Types (secondary layer) ──────────────────────────

export type SchedulingAlgorithm = 'FCFS' | 'SJF' | 'RR' | 'PRIORITY';

export interface SchedulingStep {
  step_number: number;
  process_id: string;
  action: 'start' | 'preempt' | 'resume' | 'complete' | 'wait' | 'age' | 'block';
  time_unit: number;
  reason: string;
  os_concept_note: string;
  queue_snapshot: { pid: string; burst: number; priority: number; state: string }[];
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
  label?: string;
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

export interface AlgorithmComparison {
  algorithm: SchedulingAlgorithm;
  avg_waiting_time: number;
  avg_turnaround_time: number;
  cpu_utilization: number;
  throughput: number;
  context_switches: number;
  best_for: string;
}

export interface AnalyticsData {
  utilization: { resource_id: string; resource_name: string; utilization_pct: number }[];
  algorithm_comparison: AlgorithmComparison[];
  heatmap: number[][];
  faculty_load: { faculty_id: string; name: string; hours: number; max_hours: number }[];
  fragmentation_history: { date: string; fragmentation_pct: number }[];
}

export type ResourceType = 'classroom' | 'lab' | 'faculty' | 'exam_slot';
export type ResourceStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';
export type ProcessState = 'new' | 'ready' | 'running' | 'waiting' | 'completed' | 'blocked';

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

export interface IPCMessage {
  id: string;
  from_department: string;
  to_department: string;
  type: string;
  subject: string;
  body: string;
  read: boolean;
  created_at: string;
  os_concept: string;
}
