from typing import Dict, List, Optional, Any
import threading
import time
import random


class SemaphoreState:
    def __init__(self, resource_id: int, resource_name: str, max_value: int = 1):
        self.resource_id = resource_id
        self.resource_name = resource_name
        self.value = max_value
        self.max_value = max_value
        self.waiting_queue: List[str] = []
        self.holding_processes: List[str] = []

    def to_dict(self) -> Dict[str, Any]:
        return {
            "resource_id": self.resource_id,
            "resource_name": self.resource_name,
            "value": self.value,
            "max_value": self.max_value,
            "waiting_queue": list(self.waiting_queue),
            "holding_processes": list(self.holding_processes),
            "os_concept_note": (
                f"Semaphore for {self.resource_name}: value={self.value}/{self.max_value}. "
                f"{'Resource available.' if self.value > 0 else f'{len(self.waiting_queue)} process(es) blocked in waiting queue.'} "
                "A semaphore is a synchronization primitive. sem_wait() decrements (blocks if 0), sem_signal() increments (wakes a waiting process)."
            ),
        }


class MutexState:
    def __init__(self, resource_id: int, resource_name: str):
        self.resource_id = resource_id
        self.resource_name = resource_name
        self.locked = False
        self.owner: Optional[str] = None
        self.waiting_queue: List[str] = []

    def to_dict(self) -> Dict[str, Any]:
        return {
            "resource_id": self.resource_id,
            "resource_name": self.resource_name,
            "locked": self.locked,
            "owner": self.owner,
            "waiting_queue": list(self.waiting_queue),
            "os_concept_note": (
                f"Mutex for {self.resource_name}: {'LOCKED by ' + self.owner if self.locked else 'UNLOCKED'}. "
                f"{len(self.waiting_queue)} process(es) waiting. "
                "A mutex (mutual exclusion lock) is a binary semaphore ensuring only one process accesses a critical section at a time."
            ),
        }


class ConcurrencyManager:
    def __init__(self):
        self.semaphores: Dict[int, SemaphoreState] = {}
        self.mutexes: Dict[int, MutexState] = {}
        self._lock = threading.Lock()

    def initialize_semaphores(self, resources: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Initialize semaphores for all resources."""
        results = []
        for r in resources:
            rid = r["id"]
            name = r.get("name", f"Resource-{rid}")
            rtype = r.get("type", "classroom")

            # Labs and classrooms get capacity-based semaphores
            if rtype == "lab":
                max_val = min(r.get("capacity", 30) // 10, 3)  # Up to 3 concurrent lab sections
            elif rtype == "classroom":
                max_val = 1  # Single occupancy
            else:
                max_val = 1

            sem = SemaphoreState(rid, name, max_val)
            self.semaphores[rid] = sem

            mutex = MutexState(rid, name)
            self.mutexes[rid] = mutex

            results.append(sem.to_dict())

        return results

    def sem_wait(self, resource_id: int, process_id: str) -> Dict[str, Any]:
        """Perform sem_wait (P operation) on a resource semaphore."""
        with self._lock:
            if resource_id not in self.semaphores:
                return {
                    "success": False,
                    "error": f"No semaphore for resource {resource_id}",
                    "os_concept_note": "sem_wait called on uninitialized semaphore.",
                }

            sem = self.semaphores[resource_id]

            if sem.value > 0:
                sem.value -= 1
                sem.holding_processes.append(process_id)
                return {
                    "success": True,
                    "action": "acquired",
                    "process_id": process_id,
                    "semaphore": sem.to_dict(),
                    "os_concept_note": (
                        f"sem_wait({sem.resource_name}): value decremented {sem.value + 1} -> {sem.value}. "
                        f"{process_id} enters critical section. "
                        "The process successfully acquired the semaphore without blocking."
                    ),
                }
            else:
                sem.waiting_queue.append(process_id)
                return {
                    "success": True,
                    "action": "blocked",
                    "process_id": process_id,
                    "semaphore": sem.to_dict(),
                    "os_concept_note": (
                        f"sem_wait({sem.resource_name}): value is 0, {process_id} BLOCKED. "
                        f"Added to waiting queue (position {len(sem.waiting_queue)}). "
                        "When semaphore value is 0, the calling process is suspended and placed in the semaphore's waiting queue until another process signals."
                    ),
                }

    def sem_signal(self, resource_id: int, process_id: str) -> Dict[str, Any]:
        """Perform sem_signal (V operation) on a resource semaphore."""
        with self._lock:
            if resource_id not in self.semaphores:
                return {
                    "success": False,
                    "error": f"No semaphore for resource {resource_id}",
                    "os_concept_note": "sem_signal called on uninitialized semaphore.",
                }

            sem = self.semaphores[resource_id]

            if process_id in sem.holding_processes:
                sem.holding_processes.remove(process_id)

            woken_process = None
            if sem.waiting_queue:
                woken_process = sem.waiting_queue.pop(0)
                sem.holding_processes.append(woken_process)
                # Value stays the same (decremented for new holder)
            else:
                sem.value += 1

            result = {
                "success": True,
                "action": "released",
                "process_id": process_id,
                "woken_process": woken_process,
                "semaphore": sem.to_dict(),
                "os_concept_note": (
                    f"sem_signal({sem.resource_name}): {process_id} releases resource. "
                ),
            }

            if woken_process:
                result["os_concept_note"] += (
                    f"Waiting process {woken_process} is woken up and enters critical section. "
                    "sem_signal wakes one blocked process from the FIFO waiting queue."
                )
            else:
                result["os_concept_note"] += (
                    f"No waiting processes. Semaphore value incremented to {sem.value}. "
                    "The resource is now available for the next sem_wait call."
                )

            return result

    def simulate_concurrent_bookings(self, resource_id: int, n_processes: int) -> Dict[str, Any]:
        """Simulate N processes trying to book the same resource concurrently."""
        if resource_id not in self.semaphores:
            sem = SemaphoreState(resource_id, f"Resource-{resource_id}", 1)
            self.semaphores[resource_id] = sem

        # Reset semaphore for simulation
        sem = self.semaphores[resource_id]
        sem.value = sem.max_value
        sem.waiting_queue = []
        sem.holding_processes = []

        steps = []
        process_ids = [f"P{i+1}" for i in range(n_processes)]
        random.seed(42)  # Deterministic for demo
        arrival_order = list(process_ids)
        random.shuffle(arrival_order)

        for i, pid in enumerate(arrival_order):
            result = self.sem_wait(resource_id, pid)
            steps.append({
                "step": i + 1,
                "time": i * 2,
                "process_id": pid,
                "action": f"sem_wait -> {result['action']}",
                "semaphore_value": sem.value,
                "waiting_queue": list(sem.waiting_queue),
                "holding": list(sem.holding_processes),
                "detail": result["os_concept_note"],
            })

        # Now release in order
        for i, pid in enumerate(sem.holding_processes[:]):
            result = self.sem_signal(resource_id, pid)
            steps.append({
                "step": len(arrival_order) + i + 1,
                "time": len(arrival_order) * 2 + i * 2,
                "process_id": pid,
                "action": f"sem_signal -> {result['action']}",
                "woken": result.get("woken_process"),
                "semaphore_value": sem.value,
                "waiting_queue": list(sem.waiting_queue),
                "holding": list(sem.holding_processes),
                "detail": result["os_concept_note"],
            })

        return {
            "steps": steps,
            "final_state": sem.to_dict(),
            "race_detected": False,
            "os_concept_note": (
                f"Simulated {n_processes} processes competing for resource {resource_id} using semaphore synchronization. "
                "The semaphore ensures mutual exclusion: only the allowed number of processes enter the critical section. "
                "Other processes are blocked in FIFO order, preventing race conditions."
            ),
        }

    def race_condition_demo(self, resource_id: int) -> Dict[str, Any]:
        """Demonstrate what happens WITHOUT synchronization (race condition)."""
        shared_counter = {"value": 0, "name": f"Resource-{resource_id} booking count"}
        steps = []
        n = 5

        # Simulate without locks - interleaved execution
        processes = [f"P{i+1}" for i in range(n)]
        # Simulate interleaved read-modify-write
        for i, pid in enumerate(processes):
            read_val = shared_counter["value"]
            steps.append({
                "step": i * 3 + 1,
                "process_id": pid,
                "action": "READ",
                "value_read": read_val,
                "actual_counter": shared_counter["value"],
                "detail": f"{pid} reads shared counter = {read_val}",
            })

            # Another process might write between read and write (simulated race)
            if i > 0 and i % 2 == 0:
                shared_counter["value"] = read_val  # Lost update!
                steps.append({
                    "step": i * 3 + 2,
                    "process_id": pid,
                    "action": "CONTEXT_SWITCH",
                    "value_read": read_val,
                    "actual_counter": shared_counter["value"],
                    "detail": f"Context switch! {pid} was preempted between READ and WRITE. Previous write by another process is about to be lost.",
                })

            new_val = read_val + 1
            shared_counter["value"] = new_val
            steps.append({
                "step": i * 3 + 3,
                "process_id": pid,
                "action": "WRITE",
                "value_written": new_val,
                "actual_counter": shared_counter["value"],
                "detail": f"{pid} writes counter = {new_val} (expected {i + 1})",
            })

        expected = n
        actual = shared_counter["value"]
        race_detected = actual != expected

        # Now with synchronization
        correct_counter = {"value": 0}
        correct_steps = []
        for i, pid in enumerate(processes):
            correct_counter["value"] += 1
            correct_steps.append({
                "step": i + 1,
                "process_id": pid,
                "action": "ATOMIC_INCREMENT",
                "value": correct_counter["value"],
                "detail": f"{pid} atomically increments counter to {correct_counter['value']} (protected by mutex)",
            })

        return {
            "steps": steps,
            "final_state": {
                "without_sync": {"expected": expected, "actual": actual, "race_detected": race_detected},
                "with_sync": {"expected": expected, "actual": correct_counter["value"], "correct": True},
                "correct_steps": correct_steps,
            },
            "race_detected": race_detected,
            "os_concept_note": (
                f"Race condition demonstration: {n} processes increment a shared counter. "
                f"Without synchronization: expected {expected}, got {actual} (lost updates due to interleaved read-modify-write). "
                f"With mutex protection: all increments are atomic, final value = {correct_counter['value']}. "
                "This demonstrates why critical sections must be protected with synchronization primitives (mutex/semaphore) to prevent data corruption."
            ),
        }

    def get_all_states(self) -> Dict[str, Any]:
        """Get current state of all semaphores and mutexes."""
        return {
            "semaphores": {str(k): v.to_dict() for k, v in self.semaphores.items()},
            "mutexes": {str(k): v.to_dict() for k, v in self.mutexes.items()},
            "os_concept_note": "Overview of all synchronization primitives in the system. Semaphores control concurrent access to shared resources. Mutexes provide exclusive ownership.",
        }
