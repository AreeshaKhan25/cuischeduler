from typing import List, Dict, Any, Optional, Tuple, Set
from datetime import date, time


class DeadlockDetector:

    def build_rag(self, bookings: List[Dict[str, Any]], resources: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Build Resource Allocation Graph from current bookings and resources."""
        nodes = []
        edges = []
        resource_map = {r["id"]: r for r in resources}
        process_ids_seen = set()
        resource_ids_seen = set()

        for b in bookings:
            pid = b.get("process_id", f"P{b['id']}")
            state = b.get("state", "new")
            rid = b.get("resource_id")

            if pid not in process_ids_seen:
                nodes.append({
                    "id": pid,
                    "label": f"{pid}: {b.get('title', 'Booking')}",
                    "type": "process",
                    "in_cycle": False,
                })
                process_ids_seen.add(pid)

            if rid and rid in resource_map:
                r_key = f"R{rid}"
                if r_key not in resource_ids_seen:
                    r = resource_map[rid]
                    nodes.append({
                        "id": r_key,
                        "label": f"{r_key}: {r.get('name', 'Resource')}",
                        "type": "resource",
                        "in_cycle": False,
                    })
                    resource_ids_seen.add(r_key)

                if state in ("running", "completed"):
                    # Assignment edge: resource -> process (resource is held by process)
                    edges.append({
                        "source": r_key,
                        "target": pid,
                        "label": "assigned_to",
                        "in_cycle": False,
                    })
                elif state in ("waiting", "blocked"):
                    # Request edge: process -> resource (process is waiting for resource)
                    edges.append({
                        "source": pid,
                        "target": r_key,
                        "label": "requests",
                        "in_cycle": False,
                    })

        return {"nodes": nodes, "edges": edges}

    def detect_cycle_dfs(self, nodes: List[Dict], edges: List[Dict]) -> Dict[str, Any]:
        """DFS-based cycle detection on the RAG."""
        adjacency: Dict[str, List[str]] = {}
        for n in nodes:
            adjacency[n["id"]] = []
        for e in edges:
            if e["source"] in adjacency:
                adjacency[e["source"]].append(e["target"])

        visited: Set[str] = set()
        rec_stack: Set[str] = set()
        parent: Dict[str, Optional[str]] = {}
        all_cycles: List[List[str]] = []

        def dfs(node: str) -> bool:
            visited.add(node)
            rec_stack.add(node)
            found = False

            for neighbor in adjacency.get(node, []):
                if neighbor not in visited:
                    parent[neighbor] = node
                    if dfs(neighbor):
                        found = True
                elif neighbor in rec_stack:
                    # Found a cycle - trace it back
                    cycle = [neighbor]
                    current = node
                    while current != neighbor:
                        cycle.append(current)
                        current = parent.get(current, neighbor)
                    cycle.append(neighbor)
                    cycle.reverse()
                    all_cycles.append(cycle)
                    found = True

            rec_stack.discard(node)
            return found

        for n in nodes:
            if n["id"] not in visited:
                parent[n["id"]] = None
                dfs(n["id"])

        has_deadlock = len(all_cycles) > 0
        cycle_nodes_set: Set[str] = set()
        cycle_edges_set: Set[Tuple[str, str]] = set()

        for cycle in all_cycles:
            for i in range(len(cycle) - 1):
                cycle_nodes_set.add(cycle[i])
                cycle_edges_set.add((cycle[i], cycle[i + 1]))

        # Mark in_cycle on nodes and edges
        for n in nodes:
            if n["id"] in cycle_nodes_set:
                n["in_cycle"] = True
        for e in edges:
            if (e["source"], e["target"]) in cycle_edges_set:
                e["in_cycle"] = True

        cycle_desc = None
        if all_cycles:
            cycle_desc = " -> ".join(all_cycles[0])

        deadlocked_processes = [n["id"] for n in nodes if n["in_cycle"] and n["type"] == "process"]
        deadlocked_resources = [n["id"] for n in nodes if n["in_cycle"] and n["type"] == "resource"]

        return {
            "has_deadlock": has_deadlock,
            "deadlocked_processes": deadlocked_processes,
            "deadlocked_resources": deadlocked_resources,
            "cycle": all_cycles[0] if all_cycles else [],
            "cycle_description": cycle_desc,
            "nodes": nodes,
            "edges": edges,
        }

    def run_bankers(self, processes: List[str], resources: List[str],
                    max_matrix: List[List[int]], allocation_matrix: List[List[int]],
                    available: List[int]) -> Dict[str, Any]:
        """Full Banker's Algorithm with step-by-step trace."""
        n_proc = len(processes)
        n_res = len(resources)

        # Calculate Need matrix
        need = []
        for i in range(n_proc):
            row = []
            for j in range(n_res):
                row.append(max_matrix[i][j] - allocation_matrix[i][j])
            need.append(row)

        work = list(available)
        finish = [False] * n_proc
        safe_sequence = []
        steps = []
        step_num = 0

        bankers_processes = []
        for i in range(n_proc):
            bankers_processes.append({
                "process_id": processes[i],
                "allocation": list(allocation_matrix[i]),
                "max_need": list(max_matrix[i]),
                "need": list(need[i]),
            })

        while True:
            found = False
            for i in range(n_proc):
                if finish[i]:
                    continue

                # Check if Need[i] <= Work
                can_finish = all(need[i][j] <= work[j] for j in range(n_res))

                if can_finish:
                    step_num += 1
                    work_before = list(work)
                    # Release resources
                    for j in range(n_res):
                        work[j] += allocation_matrix[i][j]

                    steps.append({
                        "step": step_num,
                        "process_id": processes[i],
                        "work_before": work_before,
                        "need": list(need[i]),
                        "allocation": list(allocation_matrix[i]),
                        "work_after": list(work),
                        "can_finish": True,
                        "explanation": (
                            f"Step {step_num}: Check {processes[i]} - Need {need[i]} <= Work {work_before}? YES. "
                            f"{processes[i]} can finish. Release its allocation {list(allocation_matrix[i])}. "
                            f"New Work = {list(work)}."
                        ),
                    })

                    finish[i] = True
                    safe_sequence.append(processes[i])
                    found = True
                    break  # Restart scan

            if not found:
                # Record remaining unfinished processes
                for i in range(n_proc):
                    if not finish[i]:
                        step_num += 1
                        steps.append({
                            "step": step_num,
                            "process_id": processes[i],
                            "work_before": list(work),
                            "need": list(need[i]),
                            "allocation": list(allocation_matrix[i]),
                            "work_after": list(work),
                            "can_finish": False,
                            "explanation": (
                                f"Step {step_num}: Check {processes[i]} - Need {need[i]} <= Work {list(work)}? NO. "
                                f"{processes[i]} cannot finish with current available resources."
                            ),
                        })
                break

        is_safe = all(finish)

        return {
            "is_safe": is_safe,
            "safe_sequence": safe_sequence if is_safe else None,
            "steps": steps,
            "processes": bankers_processes,
            "available": list(available),
            "os_concept_note": (
                f"Banker's Algorithm result: {'SAFE' if is_safe else 'UNSAFE'} state. "
                f"{'Safe sequence: ' + ' -> '.join(safe_sequence) + '. All processes can complete without deadlock.' if is_safe else 'No safe sequence exists. Granting this request could lead to deadlock.'} "
                "The Banker's Algorithm is a deadlock avoidance strategy that simulates allocation to determine if the system remains in a safe state."
            ),
        }

    def create_demo_scenario(self, scenario_type: str, db) -> Dict[str, Any]:
        """Create demo booking scenarios for deadlock demonstration."""
        from models.booking import Booking, BookingState
        from models.resource import Resource
        from datetime import date as date_cls, time as time_cls

        today = date_cls.today()

        if scenario_type == "classic":
            # Classic deadlock: P1 holds R1 wants R2, P2 holds R2 wants R1
            resources = db.query(Resource).limit(2).all()
            if len(resources) < 2:
                return {"error": "Need at least 2 resources for classic deadlock scenario"}

            r1, r2 = resources[0], resources[1]

            # Get next process IDs
            max_booking = db.query(Booking).order_by(Booking.id.desc()).first()
            next_id = (max_booking.id + 1) if max_booking else 1

            # P_A holds R1 (running)
            b1 = Booking(
                process_id=f"P{next_id}",
                title=f"Deadlock Demo: {r1.name} holder",
                department="Computer Science",
                resource_id=r1.id,
                resource_type=r1.type.value if hasattr(r1.type, 'value') else str(r1.type),
                requested_by=1,
                date=today,
                start_time=time_cls(9, 0),
                end_time=time_cls(10, 0),
                duration_minutes=60,
                priority=5,
                state=BookingState.running,
                arrival_time=0,
                os_concept_note=f"Process holds {r1.name} and will request {r2.name}, creating circular wait.",
            )
            db.add(b1)
            db.flush()

            # P_B holds R2, wants R1 (waiting/blocked)
            b2 = Booking(
                process_id=f"P{next_id + 1}",
                title=f"Deadlock Demo: {r2.name} holder",
                department="Computer Science",
                resource_id=r2.id,
                resource_type=r2.type.value if hasattr(r2.type, 'value') else str(r2.type),
                requested_by=1,
                date=today,
                start_time=time_cls(9, 0),
                end_time=time_cls(10, 0),
                duration_minutes=60,
                priority=5,
                state=BookingState.blocked,
                arrival_time=0,
                os_concept_note=f"Process holds {r2.name} and requests {r1.name} (held by P{next_id}), completing the circular wait.",
            )
            db.add(b2)

            # Create the waiting relationship: P_A also wants R2
            b3 = Booking(
                process_id=f"P{next_id + 2}",
                title=f"Deadlock Demo: {r1.name} requester also wants {r2.name}",
                department="Computer Science",
                resource_id=r2.id,
                resource_type=r2.type.value if hasattr(r2.type, 'value') else str(r2.type),
                requested_by=1,
                date=today,
                start_time=time_cls(9, 0),
                end_time=time_cls(10, 0),
                duration_minutes=60,
                priority=5,
                state=BookingState.waiting,
                arrival_time=0,
                os_concept_note="This process represents the second request edge completing the deadlock cycle.",
            )
            db.add(b3)
            db.commit()

            return {
                "scenario": "classic",
                "description": f"Classic deadlock created: P{next_id} holds {r1.name} and wants {r2.name}; P{next_id+1} holds {r2.name} and wants {r1.name}.",
                "booking_ids": [b1.id, b2.id, b3.id],
                "os_concept_note": "Classic two-process deadlock demonstrating all four Coffman conditions: mutual exclusion (single-instance resources), hold and wait (each holds one, requests another), no preemption (resources not forcibly taken), circular wait (P1->R2->P2->R1->P1).",
            }

        elif scenario_type == "chain":
            # Chain deadlock: P1->R1->P2->R2->P3->R3->P1
            resources = db.query(Resource).limit(3).all()
            if len(resources) < 3:
                return {"error": "Need at least 3 resources for chain deadlock scenario"}

            max_booking = db.query(Booking).order_by(Booking.id.desc()).first()
            next_id = (max_booking.id + 1) if max_booking else 1

            bookings_created = []
            for i in range(3):
                r = resources[i]
                r_next = resources[(i + 1) % 3]

                # Process holds resource[i]
                b = Booking(
                    process_id=f"P{next_id + i * 2}",
                    title=f"Chain Deadlock: holds {r.name}",
                    department="Computer Science",
                    resource_id=r.id,
                    resource_type=r.type.value if hasattr(r.type, 'value') else str(r.type),
                    requested_by=1,
                    date=today,
                    start_time=time_cls(10, 0),
                    end_time=time_cls(11, 0),
                    duration_minutes=60,
                    priority=5,
                    state=BookingState.running,
                    arrival_time=i * 5,
                    os_concept_note=f"Holds {r.name}, will request {r_next.name} - part of 3-way circular wait.",
                )
                db.add(b)
                db.flush()
                bookings_created.append(b)

                # Process also waiting for resource[(i+1)%3]
                b2 = Booking(
                    process_id=f"P{next_id + i * 2 + 1}",
                    title=f"Chain Deadlock: requests {r_next.name}",
                    department="Computer Science",
                    resource_id=r_next.id,
                    resource_type=r_next.type.value if hasattr(r_next.type, 'value') else str(r_next.type),
                    requested_by=1,
                    date=today,
                    start_time=time_cls(10, 0),
                    end_time=time_cls(11, 0),
                    duration_minutes=60,
                    priority=5,
                    state=BookingState.waiting,
                    arrival_time=i * 5,
                    os_concept_note=f"Requests {r_next.name} which is held by another process in the chain.",
                )
                db.add(b2)
                db.flush()
                bookings_created.append(b2)

            db.commit()

            return {
                "scenario": "chain",
                "description": "Chain deadlock with 3 processes in circular wait.",
                "booking_ids": [b.id for b in bookings_created],
                "os_concept_note": "Chain deadlock demonstrates that circular wait can involve more than 2 processes. P1->R2->P2->R3->P3->R1->P1 forms a cycle of length 3. This is harder to detect than simple 2-process deadlock and requires DFS cycle detection.",
            }

        elif scenario_type == "safe":
            # Safe state: processes can complete in some order
            resources = db.query(Resource).limit(2).all()
            if len(resources) < 2:
                return {"error": "Need at least 2 resources for safe scenario"}

            max_booking = db.query(Booking).order_by(Booking.id.desc()).first()
            next_id = (max_booking.id + 1) if max_booking else 1

            bookings_created = []
            for i in range(3):
                r = resources[i % len(resources)]
                b = Booking(
                    process_id=f"P{next_id + i}",
                    title=f"Safe State Demo: Process {i+1}",
                    department="Computer Science",
                    resource_id=r.id,
                    resource_type=r.type.value if hasattr(r.type, 'value') else str(r.type),
                    requested_by=1,
                    date=today,
                    start_time=time_cls(11, 0),
                    end_time=time_cls(12, 0),
                    duration_minutes=60,
                    priority=5 - i,
                    state=BookingState.ready,
                    arrival_time=i * 10,
                    os_concept_note="Process in safe state - no circular dependency exists.",
                )
                db.add(b)
                db.flush()
                bookings_created.append(b)

            db.commit()

            return {
                "scenario": "safe",
                "description": "Safe state demonstration: all processes can complete without deadlock.",
                "booking_ids": [b.id for b in bookings_created],
                "os_concept_note": "A safe state means there exists at least one sequence in which all processes can acquire their needed resources and complete. The Banker's Algorithm ensures the system never enters an unsafe state by checking each allocation request against the safety condition.",
            }

        return {"error": f"Unknown scenario type: {scenario_type}"}

    def resolve_deadlock(self, deadlocked_bookings: List[Dict[str, Any]], strategy: str, db) -> Dict[str, Any]:
        """Resolve deadlock using the specified strategy."""
        from models.booking import Booking, BookingState

        if strategy == "terminate_youngest":
            # Terminate the most recently created process
            sorted_bookings = sorted(deadlocked_bookings, key=lambda b: b["id"], reverse=True)
            victim = sorted_bookings[0]
            booking = db.query(Booking).filter(Booking.id == victim["id"]).first()
            if booking:
                booking.state = BookingState.new
                booking.resource_id = None
                booking.os_concept_note = f"Process terminated to resolve deadlock (victim selection: youngest process). Released resources returned to pool."
                db.commit()

            return {
                "resolved": True,
                "strategy": strategy,
                "victim": victim.get("process_id", f"P{victim['id']}"),
                "action": "Process terminated and resources released",
                "os_concept_note": "Deadlock resolved by process termination. The youngest process was selected as the victim (least work lost). This is a recovery strategy - the OS forcibly terminates a deadlocked process to break the circular wait condition.",
            }

        elif strategy == "preempt_lowest_priority":
            sorted_bookings = sorted(deadlocked_bookings, key=lambda b: b.get("priority", 5), reverse=True)
            victim = sorted_bookings[0]
            booking = db.query(Booking).filter(Booking.id == victim["id"]).first()
            if booking:
                booking.state = BookingState.ready
                booking.resource_id = None
                booking.os_concept_note = f"Resources preempted from lowest priority process to resolve deadlock."
                db.commit()

            return {
                "resolved": True,
                "strategy": strategy,
                "victim": victim.get("process_id", f"P{victim['id']}"),
                "action": "Resources preempted from lowest priority process",
                "os_concept_note": "Deadlock resolved by resource preemption. The lowest-priority process loses its resources, breaking the hold-and-wait condition. The preempted process returns to the ready queue and must re-acquire resources.",
            }

        elif strategy == "rollback":
            for b in deadlocked_bookings:
                booking = db.query(Booking).filter(Booking.id == b["id"]).first()
                if booking:
                    booking.state = BookingState.ready
                    booking.resource_id = None
                    booking.os_concept_note = "Process rolled back to ready state. All held resources released."
            db.commit()

            return {
                "resolved": True,
                "strategy": strategy,
                "victim": "all_deadlocked",
                "action": "All deadlocked processes rolled back to ready state",
                "os_concept_note": "Deadlock resolved by rolling back all deadlocked processes to a safe checkpoint. All resources are released and processes must re-request them. This is the safest but most expensive recovery strategy.",
            }

        return {"resolved": False, "error": f"Unknown strategy: {strategy}"}
