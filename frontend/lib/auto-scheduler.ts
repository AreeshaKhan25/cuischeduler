import { PrismaClient } from "@prisma/client";
import { TIME_SLOT_DETAILS, DAYS } from "@/constants/cuiData";

// ─── Types ───────────────────────────────────────────────────────

interface OfferingWithRelations {
  id: number;
  classesPerWeek: number;
  labsPerWeek: number;
  course: { id: number; code: string; name: string; isLab: boolean; isTechnical: boolean; department: string };
  section: { id: number; name: string; strength: number };
  faculty: { id: number; name: string } | null;
}

interface Placement {
  courseOfferingId: number;
  resourceId: number;
  dayOfWeek: string;
  slotIndex: number;
  startTime: string;
  endTime: string;
  isLab: boolean;
}

interface FailedPlacement {
  courseOfferingId: number;
  courseName: string;
  sectionName: string;
  reason: string;
}

export interface AutoScheduleOutput {
  placed: number;
  failed: number;
  total: number;
  placements: Placement[];
  failures: FailedPlacement[];
  osNote: string;
}

// ─── Availability Tracking ───────────────────────────────────────

type SlotKey = string; // "Monday-0", "Tuesday-3", etc.

function slotKey(day: string, slot: number): SlotKey {
  return `${day}-${slot}`;
}

class AvailabilityMatrix {
  // Track what's occupied: resourceId -> Set of slotKeys
  private roomOccupied = new Map<number, Set<string>>();
  // facultyId -> Set of slotKeys
  private facultyOccupied = new Map<number, Set<string>>();
  // sectionId -> Set of slotKeys
  private sectionOccupied = new Map<number, Set<string>>();
  // sectionId -> day -> count of classes that day
  private sectionDayLoad = new Map<number, Map<string, number>>();

  isRoomFree(resourceId: number, day: string, slot: number): boolean {
    return !this.roomOccupied.get(resourceId)?.has(slotKey(day, slot));
  }

  isFacultyFree(facultyId: number, day: string, slot: number): boolean {
    return !this.facultyOccupied.get(facultyId)?.has(slotKey(day, slot));
  }

  isSectionFree(sectionId: number, day: string, slot: number): boolean {
    return !this.sectionOccupied.get(sectionId)?.has(slotKey(day, slot));
  }

  getSectionDayLoad(sectionId: number, day: string): number {
    return this.sectionDayLoad.get(sectionId)?.get(day) ?? 0;
  }

  book(resourceId: number, facultyId: number | null, sectionId: number, day: string, slot: number) {
    const key = slotKey(day, slot);

    if (!this.roomOccupied.has(resourceId)) this.roomOccupied.set(resourceId, new Set());
    this.roomOccupied.get(resourceId)!.add(key);

    if (facultyId) {
      if (!this.facultyOccupied.has(facultyId)) this.facultyOccupied.set(facultyId, new Set());
      this.facultyOccupied.get(facultyId)!.add(key);
    }

    if (!this.sectionOccupied.has(sectionId)) this.sectionOccupied.set(sectionId, new Set());
    this.sectionOccupied.get(sectionId)!.add(key);

    if (!this.sectionDayLoad.has(sectionId)) this.sectionDayLoad.set(sectionId, new Map());
    const dayMap = this.sectionDayLoad.get(sectionId)!;
    dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
  }
}

// ─── Main Auto-Scheduler ────────────────────────────────────────

export async function autoSchedule(
  prisma: PrismaClient,
  semesterId: number
): Promise<AutoScheduleOutput> {
  // 1. Load all offerings for this semester
  const offerings = await prisma.courseOffering.findMany({
    where: { semesterId },
    include: {
      course: true,
      section: true,
      faculty: true,
    },
  }) as unknown as OfferingWithRelations[];

  // 2. Load all rooms and labs
  const rooms = await prisma.resource.findMany({
    where: { type: "classroom", status: "available" },
    orderBy: { capacity: "desc" },
  });
  const labs = await prisma.resource.findMany({
    where: { type: "lab", status: "available" },
    orderBy: { capacity: "desc" },
  });

  // 3. Load existing timetable entries (in case of partial re-schedule)
  const existing = await prisma.timetableEntry.findMany({
    where: { semesterId },
    include: { courseOffering: { include: { section: true } } },
  });

  // 4. Initialize availability matrix with existing entries
  const matrix = new AvailabilityMatrix();
  for (const entry of existing) {
    const offering = offerings.find((o) => o.id === entry.courseOfferingId);
    matrix.book(
      entry.resourceId,
      offering?.faculty?.id ?? null,
      entry.courseOffering.section.id,
      entry.dayOfWeek,
      entry.slotIndex
    );
    // For lab entries occupying 2 slots
    if (entry.isLab) {
      matrix.book(
        entry.resourceId,
        offering?.faculty?.id ?? null,
        entry.courseOffering.section.id,
        entry.dayOfWeek,
        entry.slotIndex + 1
      );
    }
  }

  // 5. Build list of classes to place
  interface ClassToPlace {
    offering: OfferingWithRelations;
    isLab: boolean;
    priority: number; // lower = place first (more constrained)
  }

  const classesToPlace: ClassToPlace[] = [];

  for (const off of offerings) {
    // Skip if already fully scheduled
    const existingCount = existing.filter(
      (e) => e.courseOfferingId === off.id && !e.isLab
    ).length;
    const existingLabs = existing.filter(
      (e) => e.courseOfferingId === off.id && e.isLab
    ).length;

    // Add remaining theory classes
    for (let i = existingCount; i < off.classesPerWeek; i++) {
      classesToPlace.push({
        offering: off,
        isLab: false,
        // Labs are more constrained (need lab rooms + 2 slots), place them first
        // Larger sections are more constrained (fewer rooms fit), place first
        priority: off.section.strength,
      });
    }

    // Add remaining lab classes
    for (let i = existingLabs; i < off.labsPerWeek; i++) {
      classesToPlace.push({
        offering: off,
        isLab: true,
        priority: 0, // Labs always first (most constrained)
      });
    }
  }

  // Sort: labs first, then by section strength descending (most constrained first)
  classesToPlace.sort((a, b) => {
    if (a.isLab !== b.isLab) return a.isLab ? -1 : 1;
    return a.priority - b.priority; // Lower priority number = more constrained = first
  });

  // 6. Greedy placement
  const placements: Placement[] = [];
  const failures: FailedPlacement[] = [];
  const days = [...DAYS];

  for (const item of classesToPlace) {
    const { offering, isLab } = item;
    const sectionId = offering.section.id;
    const facultyId = offering.faculty?.id ?? null;
    const strength = offering.section.strength;

    // Find suitable rooms
    const suitableRooms = isLab
      ? labs.filter((r) => r.capacity >= strength)
      : rooms.filter((r) => r.capacity >= strength);

    if (suitableRooms.length === 0) {
      failures.push({
        courseOfferingId: offering.id,
        courseName: offering.course.name,
        sectionName: offering.section.name,
        reason: `No ${isLab ? "lab" : "room"} with capacity >= ${strength}`,
      });
      continue;
    }

    // Score all feasible (day, slot, room) triples
    interface Candidate {
      day: string;
      slot: number;
      room: typeof suitableRooms[0];
      score: number;
    }

    const candidates: Candidate[] = [];

    for (const day of days) {
      const maxSlot = isLab ? TIME_SLOT_DETAILS.length - 2 : TIME_SLOT_DETAILS.length - 1;

      for (let slot = 0; slot <= maxSlot; slot++) {
        // Check section availability
        if (!matrix.isSectionFree(sectionId, day, slot)) continue;
        if (isLab && !matrix.isSectionFree(sectionId, day, slot + 1)) continue;

        // Check faculty availability
        if (facultyId && !matrix.isFacultyFree(facultyId, day, slot)) continue;
        if (facultyId && isLab && !matrix.isFacultyFree(facultyId, day, slot + 1)) continue;

        for (const room of suitableRooms) {
          // Check room availability
          if (!matrix.isRoomFree(room.id, day, slot)) continue;
          if (isLab && !matrix.isRoomFree(room.id, day, slot + 1)) continue;

          // Score: prefer spreading across days, avoid overloading one day
          let score = 100;

          // Penalty for same day load (spread classes across days)
          const dayLoad = matrix.getSectionDayLoad(sectionId, day);
          score -= dayLoad * 20;

          // Slight preference for morning slots
          score -= slot * 2;

          // Prefer rooms closer to section's capacity (less waste)
          const capacityWaste = room.capacity - strength;
          score -= capacityWaste * 0.5;

          // Avoid lunch-adjacent slots (slot 3 and 4) slightly
          if (slot === 3 || slot === 4) score -= 5;

          candidates.push({ day, slot, room, score });
        }
      }
    }

    if (candidates.length === 0) {
      failures.push({
        courseOfferingId: offering.id,
        courseName: offering.course.name,
        sectionName: offering.section.name,
        reason: "No available (day, slot, room) combination",
      });
      continue;
    }

    // Pick best candidate
    candidates.sort((a, b) => b.score - a.score);
    const best = candidates[0];
    const slotDetail = TIME_SLOT_DETAILS[best.slot];

    if (isLab) {
      const nextSlotDetail = TIME_SLOT_DETAILS[best.slot + 1];
      placements.push({
        courseOfferingId: offering.id,
        resourceId: best.room.id,
        dayOfWeek: best.day,
        slotIndex: best.slot,
        startTime: slotDetail.start,
        endTime: nextSlotDetail.end,
        isLab: true,
      });
      matrix.book(best.room.id, facultyId, sectionId, best.day, best.slot);
      matrix.book(best.room.id, facultyId, sectionId, best.day, best.slot + 1);
    } else {
      placements.push({
        courseOfferingId: offering.id,
        resourceId: best.room.id,
        dayOfWeek: best.day,
        slotIndex: best.slot,
        startTime: slotDetail.start,
        endTime: slotDetail.end,
        isLab: false,
      });
      matrix.book(best.room.id, facultyId, sectionId, best.day, best.slot);
    }
  }

  return {
    placed: placements.length,
    failed: failures.length,
    total: classesToPlace.length,
    placements,
    failures,
    osNote:
      "Auto-scheduling used a constraint-based greedy algorithm with priority ordering. " +
      "Lab sessions (most constrained) are scheduled first, followed by large-section classes. " +
      "This mirrors Priority CPU Scheduling (OS Ch.5) where high-priority processes get resources first. " +
      `${failures.length > 0 ? "Unplaceable items indicate resource contention — analogous to deadlock (OS Ch.7)." : "All classes placed successfully."}`,
  };
}

// ─── Conflict Checker ────────────────────────────────────────────

export async function checkConflict(
  prisma: PrismaClient,
  semesterId: number,
  resourceId: number,
  day: string,
  slotIndex: number,
  excludeEntryId?: number
): Promise<{ hasConflict: boolean; conflictingEntry: any | null }> {
  const where: any = {
    semesterId,
    resourceId,
    dayOfWeek: day,
    slotIndex,
  };
  if (excludeEntryId) {
    where.id = { not: excludeEntryId };
  }

  const conflict = await prisma.timetableEntry.findFirst({
    where,
    include: {
      courseOffering: {
        include: { course: true, section: true, faculty: true },
      },
      resource: true,
    },
  });

  return {
    hasConflict: !!conflict,
    conflictingEntry: conflict,
  };
}

// ─── Alternative Suggestion Engine ───────────────────────────────

export async function suggestAlternatives(
  prisma: PrismaClient,
  semesterId: number,
  resourceId: number,
  sectionId: number,
  facultyId: number | null,
  preferredDay?: string,
  maxSuggestions = 5
): Promise<Array<{ day: string; slotIndex: number; startTime: string; endTime: string; resourceId: number; resourceName: string }>> {
  // Get all occupied slots for this semester
  const entries = await prisma.timetableEntry.findMany({
    where: { semesterId },
    include: {
      courseOffering: { include: { section: true } },
      resource: true,
    },
  });

  // Get the target resource
  const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
  if (!resource) return [];

  // Get similar rooms (same type, adequate capacity)
  const similarRooms = await prisma.resource.findMany({
    where: {
      type: resource.type,
      capacity: { gte: resource.capacity - 10 },
      status: "available",
    },
  });

  const suggestions: Array<{
    day: string; slotIndex: number; startTime: string; endTime: string;
    resourceId: number; resourceName: string; score: number;
  }> = [];

  // Build occupied sets
  const roomOccupied = new Set<string>();
  const sectionOccupiedSet = new Set<string>();
  const facultyOccupiedSet = new Set<string>();

  for (const e of entries) {
    roomOccupied.add(`${e.resourceId}-${e.dayOfWeek}-${e.slotIndex}`);
    sectionOccupiedSet.add(`${e.courseOffering.section.id}-${e.dayOfWeek}-${e.slotIndex}`);
    if (e.courseOffering.facultyId) {
      facultyOccupiedSet.add(`${e.courseOffering.facultyId}-${e.dayOfWeek}-${e.slotIndex}`);
    }
  }

  for (const room of similarRooms) {
    for (const day of DAYS) {
      for (const slot of TIME_SLOT_DETAILS) {
        const roomKey = `${room.id}-${day}-${slot.index}`;
        const sectionKey = `${sectionId}-${day}-${slot.index}`;

        if (roomOccupied.has(roomKey)) continue;
        if (sectionOccupiedSet.has(sectionKey)) continue;
        if (facultyId && facultyOccupiedSet.has(`${facultyId}-${day}-${slot.index}`)) continue;

        let score = 100;
        if (preferredDay && day === preferredDay) score += 20;
        if (room.id === resourceId) score += 10; // same room preferred
        score -= slot.index * 2; // prefer earlier slots

        suggestions.push({
          day,
          slotIndex: slot.index,
          startTime: slot.start,
          endTime: slot.end,
          resourceId: room.id,
          resourceName: room.name,
          score,
        });
      }
    }
  }

  suggestions.sort((a, b) => b.score - a.score);
  return suggestions.slice(0, maxSuggestions).map(({ score, ...rest }) => rest);
}
