from typing import List, Dict, Any, Optional
from copy import deepcopy


class ProcessInfo:
    """Internal representation of a booking as a schedulable process."""
    def __init__(self, process_id: str, booking_id: int, arrival_time: float,
                 burst_time: float, priority: int):
        self.process_id = process_id
        self.booking_id = booking_id
        self.arrival_time = arrival_time
        self.burst_time = burst_time
        self.remaining_time = burst_time
        self.priority = priority
        self.original_priority = priority
        self.waiting_time = 0.0
        self.turnaround_time = 0.0
        self.completion_time = 0.0
        self.start_time: Optional[float] = None
        self.started = False


class SchedulingEngine:

    def _build_processes(self, requests: List[Dict[str, Any]]) -> List[ProcessInfo]:
        processes = []
        for r in requests:
            p = ProcessInfo(
                process_id=r.get("process_id", f"P{r['id']}"),
                booking_id=r["id"],
                arrival_time=r.get("arrival_time", 0),
                burst_time=r.get("duration_minutes", 60),
                priority=r.get("priority", 5),
            )
            processes.append(p)
        return processes

    def run_fcfs(self, requests: List[Dict[str, Any]]) -> Dict[str, Any]:
        """First Come First Served scheduling algorithm."""
        processes = self._build_processes(requests)
        processes.sort(key=lambda p: (p.arrival_time, p.booking_id))

        steps = []
        gantt = []
        current_time = 0.0

        for p in processes:
            if current_time < p.arrival_time:
                steps.append({
                    "time": current_time,
                    "action": "idle",
                    "process_id": "IDLE",
                    "detail": f"CPU idle from {current_time} to {p.arrival_time}. No process has arrived yet.",
                    "os_concept_note": "CPU idle time represents wasted cycles. In FCFS, idle time occurs when no process is in the ready queue.",
                    "ready_queue": [],
                })
                current_time = p.arrival_time

            ready_at_this_time = [
                q.process_id for q in processes
                if q.arrival_time <= current_time and q.remaining_time > 0
                and q.process_id != p.process_id
            ]

            p.start_time = current_time
            p.waiting_time = current_time - p.arrival_time
            steps.append({
                "time": current_time,
                "action": "dispatch",
                "process_id": p.process_id,
                "detail": f"Dispatching {p.process_id} (burst={p.burst_time}min, arrived={p.arrival_time}). FCFS selects the earliest arriving process.",
                "os_concept_note": f"FCFS dispatches {p.process_id} because it arrived first (time={p.arrival_time}). FCFS is non-preemptive: once a process starts, it runs to completion. This is the simplest scheduling algorithm, analogous to a FIFO queue.",
                "ready_queue": ready_at_this_time,
            })

            gantt.append({
                "process_id": p.process_id,
                "booking_id": p.booking_id,
                "start": current_time,
                "end": current_time + p.burst_time,
                "state": "running",
            })

            current_time += p.burst_time
            p.completion_time = current_time
            p.turnaround_time = p.completion_time - p.arrival_time
            p.remaining_time = 0

            steps.append({
                "time": current_time,
                "action": "complete",
                "process_id": p.process_id,
                "detail": f"{p.process_id} completed at time {current_time}. Waiting={p.waiting_time}min, Turnaround={p.turnaround_time}min.",
                "os_concept_note": f"Process {p.process_id} finishes execution. Turnaround time = completion - arrival = {p.turnaround_time}min. In FCFS, long processes can cause the 'convoy effect' where short processes wait behind long ones.",
                "ready_queue": [q.process_id for q in processes if q.arrival_time <= current_time and q.remaining_time > 0],
            })

        return self._build_result("FCFS", processes, steps, gantt,
            "First Come First Served (FCFS) processes requests in arrival order. It is non-preemptive and simple but can suffer from the convoy effect where short processes queue behind long ones, increasing average waiting time.")

    def run_sjf(self, requests: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Shortest Job First (non-preemptive) scheduling algorithm."""
        processes = self._build_processes(requests)
        completed = []
        steps = []
        gantt = []
        current_time = 0.0
        remaining = list(processes)

        while remaining:
            available = [p for p in remaining if p.arrival_time <= current_time]

            if not available:
                next_arrival = min(p.arrival_time for p in remaining)
                steps.append({
                    "time": current_time,
                    "action": "idle",
                    "process_id": "IDLE",
                    "detail": f"CPU idle from {current_time} to {next_arrival}. Waiting for next process arrival.",
                    "os_concept_note": "No process in ready queue. CPU is idle until the next process arrives.",
                    "ready_queue": [],
                })
                current_time = next_arrival
                continue

            available.sort(key=lambda p: (p.burst_time, p.arrival_time))
            selected = available[0]

            ready_queue = [p.process_id for p in available if p.process_id != selected.process_id]

            selected.start_time = current_time
            selected.waiting_time = current_time - selected.arrival_time

            steps.append({
                "time": current_time,
                "action": "dispatch",
                "process_id": selected.process_id,
                "detail": f"SJF selects {selected.process_id} with shortest burst={selected.burst_time}min from {len(available)} ready processes. Other bursts: {', '.join(f'{p.process_id}={p.burst_time}' for p in available if p != selected)}.",
                "os_concept_note": f"SJF selects {selected.process_id} because it has the shortest CPU burst ({selected.burst_time}min) among ready processes. SJF is provably optimal for minimizing average waiting time, but requires knowing burst times in advance - in practice, these are estimated.",
                "ready_queue": ready_queue,
            })

            gantt.append({
                "process_id": selected.process_id,
                "booking_id": selected.booking_id,
                "start": current_time,
                "end": current_time + selected.burst_time,
                "state": "running",
            })

            current_time += selected.burst_time
            selected.completion_time = current_time
            selected.turnaround_time = selected.completion_time - selected.arrival_time
            selected.remaining_time = 0

            steps.append({
                "time": current_time,
                "action": "complete",
                "process_id": selected.process_id,
                "detail": f"{selected.process_id} completed. Waiting={selected.waiting_time}min, Turnaround={selected.turnaround_time}min.",
                "os_concept_note": f"{selected.process_id} completes execution. SJF gave it priority due to its short burst, reducing overall average waiting time. However, long-burst processes may suffer starvation if short ones keep arriving.",
                "ready_queue": [p.process_id for p in remaining if p != selected and p.arrival_time <= current_time],
            })

            remaining.remove(selected)
            completed.append(selected)

        return self._build_result("SJF", completed, steps, gantt,
            "Shortest Job First (SJF) is a non-preemptive algorithm that always selects the process with the smallest CPU burst from the ready queue. It is optimal for minimizing average waiting time but can cause starvation of longer processes.")

    def run_round_robin(self, requests: List[Dict[str, Any]], quantum: int = 30) -> Dict[str, Any]:
        """Round Robin scheduling with configurable time quantum."""
        processes = self._build_processes(requests)
        processes.sort(key=lambda p: (p.arrival_time, p.booking_id))

        steps = []
        gantt = []
        current_time = 0.0
        ready_queue: List[ProcessInfo] = []
        completed: List[ProcessInfo] = []
        context_switches = 0
        all_procs = list(processes)
        arrived_set = set()

        # Add initially arrived processes
        for p in all_procs:
            if p.arrival_time <= current_time and p.process_id not in arrived_set:
                ready_queue.append(p)
                arrived_set.add(p.process_id)

        while ready_queue or any(p.remaining_time > 0 for p in all_procs):
            if not ready_queue:
                pending = [p for p in all_procs if p.remaining_time > 0 and p.process_id not in arrived_set]
                if not pending:
                    break
                next_arrival = min(p.arrival_time for p in pending)
                steps.append({
                    "time": current_time,
                    "action": "idle",
                    "process_id": "IDLE",
                    "detail": f"CPU idle from {current_time} to {next_arrival}.",
                    "os_concept_note": "Ready queue empty. CPU idle until next process arrives.",
                    "ready_queue": [],
                })
                current_time = next_arrival
                for p in all_procs:
                    if p.arrival_time <= current_time and p.process_id not in arrived_set and p.remaining_time > 0:
                        ready_queue.append(p)
                        arrived_set.add(p.process_id)
                continue

            current_proc = ready_queue.pop(0)

            if not current_proc.started:
                current_proc.start_time = current_time
                current_proc.started = True

            exec_time = min(quantum, current_proc.remaining_time)

            rq_names = [p.process_id for p in ready_queue]
            steps.append({
                "time": current_time,
                "action": "dispatch",
                "process_id": current_proc.process_id,
                "detail": f"RR dispatches {current_proc.process_id} (remaining={current_proc.remaining_time}min, quantum={quantum}min). Will run for {exec_time}min.",
                "os_concept_note": f"Round Robin gives {current_proc.process_id} a time quantum of {quantum}min. If the process doesn't finish within the quantum, it is preempted and placed at the back of the ready queue. This ensures fair CPU time distribution - the hallmark of time-sharing OS.",
                "ready_queue": rq_names,
            })

            gantt.append({
                "process_id": current_proc.process_id,
                "booking_id": current_proc.booking_id,
                "start": current_time,
                "end": current_time + exec_time,
                "state": "running",
            })

            current_time += exec_time
            current_proc.remaining_time -= exec_time

            # Add newly arrived processes before re-queuing preempted process
            for p in all_procs:
                if p.arrival_time <= current_time and p.process_id not in arrived_set and p.remaining_time > 0:
                    ready_queue.append(p)
                    arrived_set.add(p.process_id)

            if current_proc.remaining_time <= 0:
                current_proc.completion_time = current_time
                current_proc.turnaround_time = current_proc.completion_time - current_proc.arrival_time
                current_proc.waiting_time = current_proc.turnaround_time - current_proc.burst_time
                completed.append(current_proc)

                steps.append({
                    "time": current_time,
                    "action": "complete",
                    "process_id": current_proc.process_id,
                    "detail": f"{current_proc.process_id} completed. Waiting={current_proc.waiting_time}min, Turnaround={current_proc.turnaround_time}min.",
                    "os_concept_note": f"{current_proc.process_id} finishes within its quantum. No context switch needed for completion.",
                    "ready_queue": [p.process_id for p in ready_queue],
                })
            else:
                ready_queue.append(current_proc)
                context_switches += 1

                steps.append({
                    "time": current_time,
                    "action": "preempt",
                    "process_id": current_proc.process_id,
                    "detail": f"{current_proc.process_id} preempted after quantum. Remaining={current_proc.remaining_time}min. Moved to back of ready queue. Context switch #{context_switches}.",
                    "os_concept_note": f"Time quantum expired for {current_proc.process_id}. The OS performs a context switch: saving the process state (PC, registers) and loading the next process. Context switches have overhead but ensure no process monopolizes the CPU.",
                    "ready_queue": [p.process_id for p in ready_queue],
                })

        result = self._build_result("Round Robin", completed, steps, gantt,
            f"Round Robin (quantum={quantum}min) is a preemptive algorithm that gives each process a fixed time slice. It ensures fairness and bounded response time at the cost of context switch overhead. Smaller quantum = better response time but more overhead.")
        result["total_context_switches"] = context_switches
        return result

    def run_priority(self, requests: List[Dict[str, Any]], aging: bool = True) -> Dict[str, Any]:
        """Priority scheduling with optional aging to prevent starvation."""
        processes = self._build_processes(requests)
        processes.sort(key=lambda p: (p.arrival_time, p.booking_id))

        steps = []
        gantt = []
        current_time = 0.0
        completed: List[ProcessInfo] = []
        remaining = list(processes)

        while remaining:
            available = [p for p in remaining if p.arrival_time <= current_time]

            if not available:
                next_arrival = min(p.arrival_time for p in remaining)
                steps.append({
                    "time": current_time,
                    "action": "idle",
                    "process_id": "IDLE",
                    "detail": f"CPU idle from {current_time} to {next_arrival}.",
                    "os_concept_note": "No process in ready queue. CPU idle.",
                    "ready_queue": [],
                })
                current_time = next_arrival
                continue

            # Apply aging: for every 5 time units a process has been waiting, increase priority by 1
            if aging:
                for p in available:
                    wait_so_far = current_time - p.arrival_time
                    aging_boost = int(wait_so_far // 5)
                    p.priority = max(1, p.original_priority - aging_boost)  # Lower number = higher priority

            # Sort by priority (lower value = higher priority), then arrival time
            available.sort(key=lambda p: (p.priority, p.arrival_time))
            selected = available[0]

            ready_queue = [p.process_id for p in available if p.process_id != selected.process_id]

            aging_note = ""
            if aging:
                aged = [p for p in available if p.priority != p.original_priority]
                if aged:
                    aging_note = f" Aging applied: {', '.join(f'{p.process_id}: {p.original_priority}->{p.priority}' for p in aged)}."

            selected.start_time = current_time
            selected.waiting_time = current_time - selected.arrival_time

            steps.append({
                "time": current_time,
                "action": "dispatch",
                "process_id": selected.process_id,
                "detail": f"Priority selects {selected.process_id} (priority={selected.priority}, burst={selected.burst_time}min).{aging_note} Priorities: {', '.join(f'{p.process_id}={p.priority}' for p in available)}.",
                "os_concept_note": f"Priority scheduling selects {selected.process_id} with highest priority (lowest number = highest priority). {'Aging prevents starvation by gradually boosting the priority of waiting processes - every 5 time units of waiting increases priority by 1.' if aging else 'Without aging, low-priority processes risk indefinite starvation.'}",
                "ready_queue": ready_queue,
            })

            gantt.append({
                "process_id": selected.process_id,
                "booking_id": selected.booking_id,
                "start": current_time,
                "end": current_time + selected.burst_time,
                "state": "running",
            })

            current_time += selected.burst_time
            selected.completion_time = current_time
            selected.turnaround_time = selected.completion_time - selected.arrival_time
            selected.remaining_time = 0

            steps.append({
                "time": current_time,
                "action": "complete",
                "process_id": selected.process_id,
                "detail": f"{selected.process_id} completed. Waiting={selected.waiting_time}min, Turnaround={selected.turnaround_time}min.",
                "os_concept_note": f"{selected.process_id} completes. Priority scheduling is non-preemptive here: once dispatched, the process runs to completion. This models how high-priority tasks (exams, labs) get scheduled before lower-priority ones (office hours).",
                "ready_queue": [p.process_id for p in remaining if p != selected and p.arrival_time <= current_time],
            })

            remaining.remove(selected)
            completed.append(selected)

        return self._build_result("Priority", completed, steps, gantt,
            "Priority Scheduling assigns each process a priority and always selects the highest-priority process. With aging enabled, waiting processes gradually gain priority to prevent indefinite starvation - a key fairness mechanism in real OS schedulers.")

    def compare_all(self, requests: List[Dict[str, Any]], quantum: int = 30) -> Dict[str, Any]:
        """Run all four algorithms on the same input and return comparison."""
        fcfs = self.run_fcfs(deepcopy(requests))
        sjf = self.run_sjf(deepcopy(requests))
        rr = self.run_round_robin(deepcopy(requests), quantum)
        priority = self.run_priority(deepcopy(requests))

        results = [fcfs, sjf, rr, priority]

        best = min(results, key=lambda r: r["avg_waiting_time"])
        best_name = best["algorithm"]

        recommendation = (
            f"{best_name} performs best for this workload with avg waiting time of "
            f"{best['avg_waiting_time']:.1f}min. "
        )

        if best_name == "SJF":
            recommendation += "SJF is optimal when burst times are known. Consider it for predictable scheduling."
        elif best_name == "FCFS":
            recommendation += "FCFS works well when processes have similar burst times (no convoy effect)."
        elif best_name == "Round Robin":
            recommendation += "Round Robin provides the fairest distribution. Good for interactive/shared environments."
        else:
            recommendation += "Priority scheduling suits workloads with varying criticality levels."

        return {
            "results": results,
            "best_algorithm": best_name,
            "recommendation": recommendation,
            "os_concept_note": "Comparing scheduling algorithms reveals trade-offs: FCFS is simple but suffers convoy effect; SJF minimizes avg waiting but may starve long processes; Round Robin ensures fairness via time-sharing; Priority scheduling serves critical tasks first but needs aging to prevent starvation.",
        }

    def _build_result(self, algorithm: str, processes: List[ProcessInfo],
                      steps: List[Dict], gantt: List[Dict], os_note: str) -> Dict[str, Any]:
        metrics = []
        total_waiting = 0.0
        total_turnaround = 0.0

        for p in processes:
            metrics.append({
                "process_id": p.process_id,
                "booking_id": p.booking_id,
                "arrival_time": p.arrival_time,
                "burst_time": p.burst_time,
                "waiting_time": p.waiting_time,
                "turnaround_time": p.turnaround_time,
                "completion_time": p.completion_time,
                "priority": p.original_priority,
            })
            total_waiting += p.waiting_time
            total_turnaround += p.turnaround_time

        n = len(processes) if processes else 1
        avg_waiting = total_waiting / n
        avg_turnaround = total_turnaround / n

        total_burst = sum(p.burst_time for p in processes)
        makespan = max((p.completion_time for p in processes), default=1)
        cpu_util = (total_burst / makespan * 100) if makespan > 0 else 0
        throughput = n / makespan if makespan > 0 else 0

        context_switches = sum(1 for s in steps if s["action"] == "preempt")

        return {
            "algorithm": algorithm,
            "steps": steps,
            "gantt_chart": gantt,
            "metrics": metrics,
            "avg_waiting_time": round(avg_waiting, 2),
            "avg_turnaround_time": round(avg_turnaround, 2),
            "total_context_switches": context_switches,
            "cpu_utilization": round(cpu_util, 2),
            "throughput": round(throughput, 4),
            "os_concept_note": os_note,
        }
