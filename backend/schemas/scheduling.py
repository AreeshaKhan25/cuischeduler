from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class SchedulingRequest(BaseModel):
    algorithm: str  # fcfs, sjf, round_robin, priority
    booking_ids: List[int]
    quantum: Optional[int] = 30


class GanttBar(BaseModel):
    process_id: str
    booking_id: int
    start: float
    end: float
    state: str = "running"


class SchedulingStep(BaseModel):
    time: float
    action: str
    process_id: str
    detail: str
    os_concept_note: str
    ready_queue: List[str]


class ProcessMetric(BaseModel):
    process_id: str
    booking_id: int
    arrival_time: float
    burst_time: float
    waiting_time: float
    turnaround_time: float
    completion_time: float
    priority: int


class SchedulingResult(BaseModel):
    algorithm: str
    steps: List[SchedulingStep]
    gantt_chart: List[GanttBar]
    metrics: List[ProcessMetric]
    avg_waiting_time: float
    avg_turnaround_time: float
    total_context_switches: int
    cpu_utilization: float
    throughput: float
    os_concept_note: str


class CompareResult(BaseModel):
    results: List[SchedulingResult]
    best_algorithm: str
    recommendation: str
    os_concept_note: str = "Comparing scheduling algorithms reveals trade-offs: FCFS is simple but suffers convoy effect; SJF minimizes avg waiting but may starve long processes; Round Robin ensures fairness via time-sharing; Priority scheduling serves critical tasks first but needs aging to prevent starvation."


class DeadlockNode(BaseModel):
    id: str
    label: str
    type: str  # process or resource
    in_cycle: bool = False


class DeadlockEdge(BaseModel):
    source: str
    target: str
    label: str
    in_cycle: bool = False


class RAGResponse(BaseModel):
    nodes: List[DeadlockNode]
    edges: List[DeadlockEdge]
    has_deadlock: bool
    cycle_description: Optional[str] = None
    os_concept_note: str = "The Resource Allocation Graph (RAG) visualizes process-resource relationships. Request edges (process->resource) and assignment edges (resource->process) reveal circular waits - a necessary condition for deadlock."


class BankersProcess(BaseModel):
    process_id: str
    allocation: List[int]
    max_need: List[int]
    need: List[int]


class BankersStep(BaseModel):
    step: int
    process_id: str
    work_before: List[int]
    need: List[int]
    allocation: List[int]
    work_after: List[int]
    can_finish: bool
    explanation: str


class BankersRequest(BaseModel):
    processes: List[Dict[str, Any]]
    resources: List[str]
    max_matrix: List[List[int]]
    allocation_matrix: List[List[int]]
    available: List[int]


class BankersResult(BaseModel):
    is_safe: bool
    safe_sequence: Optional[List[str]] = None
    steps: List[BankersStep]
    processes: List[BankersProcess]
    available: List[int]
    os_concept_note: str = "Banker's Algorithm is a deadlock avoidance strategy. It checks if granting a resource request keeps the system in a safe state - meaning there exists at least one sequence in which all processes can complete."


class DeadlockAnalysis(BaseModel):
    has_deadlock: bool
    deadlocked_processes: List[str]
    deadlocked_resources: List[str]
    cycle: List[str]
    rag: RAGResponse
    resolution_options: List[str]
    os_concept_note: str = "Deadlock occurs when four conditions hold simultaneously: mutual exclusion, hold and wait, no preemption, and circular wait. Detection uses cycle-finding in the RAG."


class SemaphoreState(BaseModel):
    resource_id: int
    resource_name: str
    value: int
    max_value: int
    waiting_queue: List[str]
    holding_processes: List[str]
    os_concept_note: str = "A semaphore is a synchronization primitive. Its value represents available resource instances. sem_wait() decrements (blocks if 0), sem_signal() increments (wakes a waiting process)."


class MutexState(BaseModel):
    resource_id: int
    resource_name: str
    locked: bool
    owner: Optional[str] = None
    waiting_queue: List[str]
    os_concept_note: str = "A mutex (mutual exclusion lock) is a binary semaphore ensuring only one process accesses a critical section at a time. The owner must release it - unlike a semaphore, it has ownership semantics."


class ConcurrencySimulation(BaseModel):
    steps: List[Dict[str, Any]]
    final_state: Dict[str, Any]
    race_detected: bool
    os_concept_note: str


class ScenarioRequest(BaseModel):
    scenario_type: str  # classic, chain, safe


class DeadlockResolveRequest(BaseModel):
    strategy: str = "terminate_youngest"  # terminate_youngest, preempt_lowest_priority, rollback
