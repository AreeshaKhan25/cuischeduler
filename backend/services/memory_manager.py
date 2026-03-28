from typing import Dict, List, Any
from datetime import time as time_cls


class MemoryManager:
    """Manages resource pools using OS memory management concepts (bitmap, fragmentation)."""

    def get_pool_state(self, resources: List[Dict[str, Any]], bookings: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Return bitmap, allocation_map, and fragmentation data for resource pools.
        Each resource type is treated as a memory pool.
        Each resource instance is a block. Booked = allocated, free = available.
        """
        # Group resources by type
        type_groups: Dict[str, List[Dict]] = {}
        for r in resources:
            rtype = r.get("type", "classroom")
            if rtype not in type_groups:
                type_groups[rtype] = []
            type_groups[rtype].append(r)

        # Map which resources are currently booked (running or blocked states)
        booked_resource_ids = set()
        resource_process_map: Dict[int, str] = {}
        for b in bookings:
            if b.get("state") in ("running", "waiting", "blocked"):
                rid = b.get("resource_id")
                if rid:
                    booked_resource_ids.add(rid)
                    resource_process_map[rid] = b.get("process_id", f"P{b['id']}")

        pool_states = []
        for rtype, res_list in type_groups.items():
            res_list.sort(key=lambda r: r["id"])
            bitmap = []
            allocation_map = {}

            for r in res_list:
                if r["id"] in booked_resource_ids:
                    bitmap.append(1)
                    allocation_map[r["name"]] = resource_process_map.get(r["id"], "allocated")
                else:
                    bitmap.append(0)
                    allocation_map[r["name"]] = "free"

            total = len(bitmap)
            allocated = sum(bitmap)
            free = total - allocated

            # Calculate fragmentation
            fragments = 0
            largest_free_block = 0
            current_free_run = 0
            in_free = False

            for bit in bitmap:
                if bit == 0:
                    current_free_run += 1
                    if not in_free:
                        fragments += 1
                        in_free = True
                else:
                    if in_free:
                        largest_free_block = max(largest_free_block, current_free_run)
                        current_free_run = 0
                        in_free = False

            if in_free:
                largest_free_block = max(largest_free_block, current_free_run)

            frag_ratio = 0.0
            if free > 0 and fragments > 1:
                frag_ratio = 1.0 - (largest_free_block / free)
            elif free > 0 and fragments <= 1:
                frag_ratio = 0.0
            else:
                frag_ratio = 0.0

            pool_states.append({
                "resource_type": rtype,
                "total": total,
                "allocated": allocated,
                "free": free,
                "bitmap": bitmap,
                "allocation_map": allocation_map,
                "fragmentation_ratio": round(frag_ratio, 4),
                "fragments": fragments,
                "largest_free_block": largest_free_block,
                "os_concept_note": (
                    f"Resource pool '{rtype}': bitmap={bitmap}. "
                    f"{allocated}/{total} blocks allocated, {free} free in {fragments} fragment(s). "
                    f"Fragmentation ratio: {frag_ratio:.1%}. "
                    "This mirrors OS bitmap-based memory allocation where each bit represents a block (free=0, allocated=1). "
                    "External fragmentation occurs when free blocks are scattered, preventing large contiguous allocations."
                ),
            })

        overall_total = sum(p["total"] for p in pool_states)
        overall_alloc = sum(p["allocated"] for p in pool_states)
        overall_frag = (
            sum(p["fragmentation_ratio"] * p["total"] for p in pool_states) / overall_total
            if overall_total > 0 else 0
        )

        return {
            "pools": pool_states,
            "overall_total": overall_total,
            "overall_allocated": overall_alloc,
            "overall_free": overall_total - overall_alloc,
            "overall_fragmentation": round(overall_frag, 4),
            "os_concept_note": (
                "Resource pool state shows bitmap allocation across all resource types. "
                "Each resource type is a separate memory partition. "
                f"System-wide: {overall_alloc}/{overall_total} resources allocated, "
                f"fragmentation = {overall_frag:.1%}. "
                "High fragmentation means scheduling compaction (defragmentation) is needed to consolidate free slots."
            ),
        }

    def compact(self, resource_type: str, db) -> Dict[str, Any]:
        """
        Compact (defragment) bookings for a resource type.
        Moves bookings to fill gaps, consolidating free slots at the end.
        """
        from models.booking import Booking, BookingState
        from models.resource import Resource, ResourceType

        # Get all resources of this type
        resources = db.query(Resource).filter(Resource.type == resource_type).order_by(Resource.id).all()
        if not resources:
            return {
                "compacted": False,
                "error": f"No resources of type {resource_type}",
                "os_concept_note": "No memory blocks of this type to compact.",
            }

        # Get active bookings on these resources
        resource_ids = [r.id for r in resources]
        active_bookings = (
            db.query(Booking)
            .filter(
                Booking.resource_id.in_(resource_ids),
                Booking.state.in_([BookingState.running, BookingState.waiting, BookingState.ready]),
            )
            .order_by(Booking.id)
            .all()
        )

        # Move bookings to first available resources (compaction)
        moves = []
        used_resources = set()

        for i, booking in enumerate(active_bookings):
            target_resource = None
            for r in resources:
                if r.id not in used_resources:
                    target_resource = r
                    break

            if target_resource and target_resource.id != booking.resource_id:
                old_resource_id = booking.resource_id
                booking.resource_id = target_resource.id
                used_resources.add(target_resource.id)
                moves.append({
                    "booking_id": booking.id,
                    "process_id": booking.process_id,
                    "from_resource": old_resource_id,
                    "to_resource": target_resource.id,
                    "to_resource_name": target_resource.name,
                })
            elif target_resource:
                used_resources.add(target_resource.id)

        db.commit()

        return {
            "compacted": True,
            "moves": moves,
            "total_moves": len(moves),
            "os_concept_note": (
                f"Memory compaction performed on '{resource_type}' pool. "
                f"{len(moves)} process(es) relocated to consolidate free blocks. "
                "Compaction moves allocated blocks to one end of memory, creating a large contiguous free block. "
                "This eliminates external fragmentation but requires updating all references (relocation). "
                "The cost is proportional to the number of blocks moved."
            ),
        }
