from pydantic import BaseModel
from typing import List, Dict, Optional, Any


class UtilizationData(BaseModel):
    resource_id: int
    resource_name: str
    resource_type: str
    total_slots: int
    booked_slots: int
    utilization_percent: float
    os_concept_note: str = "Resource utilization measures how effectively the OS allocates CPU/device time. High utilization means the scheduler is keeping resources busy, analogous to high CPU utilization in a well-tuned OS."


class UtilizationResponse(BaseModel):
    data: List[UtilizationData]
    overall_utilization: float
    os_concept_note: str = "System-wide utilization reflects the scheduler's efficiency. An OS aims for high CPU utilization while maintaining acceptable response times - the same trade-off applies to room scheduling."


class AlgorithmComparison(BaseModel):
    algorithm: str
    avg_waiting_time: float
    avg_turnaround_time: float
    throughput: float
    total_runs: int
    os_concept_note: str


class AlgorithmComparisonResponse(BaseModel):
    algorithms: List[AlgorithmComparison]
    os_concept_note: str = "Algorithm comparison mirrors OS benchmarking: each algorithm excels under different workloads. FCFS works well for uniform bursts; SJF minimizes waiting; RR provides fairness; Priority handles mixed criticality."


class HeatmapCell(BaseModel):
    day: int
    hour: int
    value: float


class HeatmapResponse(BaseModel):
    matrix: List[List[float]]
    days: List[str]
    hours: List[int]
    os_concept_note: str = "The heatmap visualizes temporal resource demand patterns, similar to how an OS profiler shows CPU usage over time to identify peak loads and idle periods."


class FacultyLoadItem(BaseModel):
    faculty_id: int
    faculty_name: str
    total_hours: float
    booking_count: int
    department: str


class FacultyLoadResponse(BaseModel):
    data: List[FacultyLoadItem]
    os_concept_note: str = "Faculty load distribution is analogous to process load balancing across multiple CPUs in a multiprocessor OS. Even distribution prevents any single core from becoming a bottleneck."


class FragmentationData(BaseModel):
    resource_type: str
    total_slots: int
    used_slots: int
    free_slots: int
    fragments: int
    largest_free_block: int
    fragmentation_ratio: float


class FragmentationResponse(BaseModel):
    data: List[FragmentationData]
    overall_fragmentation: float
    os_concept_note: str = "External fragmentation in memory management occurs when free space is scattered in small non-contiguous blocks. Similarly, scattered free time slots in a schedule reduce usable availability. Compaction (defragmentation) consolidates free blocks."
