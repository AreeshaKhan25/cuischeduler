import { create } from "zustand";
import { Resource, ResourcePoolState } from "@/types";
import { resourcesApi } from "@/lib/api";

interface ResourcesState {
  // Data
  resources: Resource[];
  poolState: ResourcePoolState | null;

  // Selection
  selectedBuilding: string;
  selectedFloor: number | null;
  selectedResource: Resource | null;

  // Filters
  typeFilter: string;
  statusFilter: string;
  searchQuery: string;

  // Loading
  isLoading: boolean;
  isCompacting: boolean;

  // Actions
  fetchResources: () => Promise<void>;
  fetchPoolState: () => Promise<void>;
  compact: () => Promise<void>;
  selectResource: (resource: Resource | null) => void;
  setSelectedBuilding: (building: string) => void;
  setSelectedFloor: (floor: number | null) => void;
  setTypeFilter: (type: string) => void;
  setStatusFilter: (status: string) => void;
  setSearchQuery: (query: string) => void;
}

// ─── Mock Resources ───────────────────────────────────────────────
const MOCK_RESOURCES: Resource[] = [
  // CS Block
  { id: "cs-101", name: "CS Lab 1", type: "lab", building: "CS Block", floor: 1, capacity: 40, status: "occupied", features: ["Projector", "PCs", "Air Conditioning"], department: "Computer Science" },
  { id: "cs-102", name: "CS Lab 2", type: "lab", building: "CS Block", floor: 1, capacity: 35, status: "available", features: ["Projector", "PCs", "Whiteboard"], department: "Computer Science" },
  { id: "cs-103", name: "Networking Lab", type: "lab", building: "CS Block", floor: 1, capacity: 30, status: "reserved", features: ["Network Racks", "PCs", "Projector"], department: "Computer Science" },
  { id: "cs-201", name: "Room 201", type: "classroom", building: "CS Block", floor: 2, capacity: 60, status: "available", features: ["Projector", "Mic System", "Air Conditioning"], department: "Computer Science" },
  { id: "cs-202", name: "Room 202", type: "classroom", building: "CS Block", floor: 2, capacity: 50, status: "occupied", features: ["Projector", "Whiteboard"], department: "Computer Science" },
  { id: "cs-203", name: "Room 203", type: "classroom", building: "CS Block", floor: 2, capacity: 45, status: "available", features: ["Smart Board", "Air Conditioning"], department: "Software Engineering" },
  { id: "cs-301", name: "AI Lab", type: "lab", building: "CS Block", floor: 3, capacity: 25, status: "occupied", features: ["GPU Workstations", "Projector", "Air Conditioning"], department: "Computer Science" },
  { id: "cs-302", name: "Room 302", type: "classroom", building: "CS Block", floor: 3, capacity: 55, status: "maintenance", features: ["Projector", "Whiteboard"], department: "Computer Science" },
  { id: "cs-303", name: "SE Lab", type: "lab", building: "CS Block", floor: 3, capacity: 30, status: "available", features: ["PCs", "Projector", "Git Server"], department: "Software Engineering" },

  // EE Block
  { id: "ee-101", name: "Circuits Lab", type: "lab", building: "EE Block", floor: 1, capacity: 30, status: "occupied", features: ["Oscilloscopes", "Function Generators"], department: "Electrical Engineering" },
  { id: "ee-102", name: "Power Lab", type: "lab", building: "EE Block", floor: 1, capacity: 25, status: "available", features: ["Power Equipment", "Safety Gear"], department: "Electrical Engineering" },
  { id: "ee-201", name: "Room 201", type: "classroom", building: "EE Block", floor: 2, capacity: 50, status: "reserved", features: ["Projector", "Air Conditioning"], department: "Electrical Engineering" },
  { id: "ee-202", name: "Room 202", type: "classroom", building: "EE Block", floor: 2, capacity: 55, status: "available", features: ["Projector", "Whiteboard"], department: "Electrical Engineering" },
  { id: "ee-301", name: "DSP Lab", type: "lab", building: "EE Block", floor: 3, capacity: 28, status: "available", features: ["DSP Kits", "PCs", "MATLAB"], department: "Electrical Engineering" },

  // New Block
  { id: "nb-101", name: "Lecture Hall A", type: "classroom", building: "New Block", floor: 1, capacity: 120, status: "occupied", features: ["Projector", "Mic System", "Air Conditioning", "Recording"], department: "Management Sciences" },
  { id: "nb-102", name: "Lecture Hall B", type: "classroom", building: "New Block", floor: 1, capacity: 100, status: "available", features: ["Projector", "Mic System", "Air Conditioning"], department: "Management Sciences" },
  { id: "nb-201", name: "Room 201", type: "classroom", building: "New Block", floor: 2, capacity: 60, status: "available", features: ["Smart Board", "Air Conditioning"], department: "Mathematics" },
  { id: "nb-202", name: "Room 202", type: "classroom", building: "New Block", floor: 2, capacity: 60, status: "reserved", features: ["Projector", "Air Conditioning"], department: "Mathematics" },
  { id: "nb-301", name: "Computer Lab", type: "lab", building: "New Block", floor: 3, capacity: 40, status: "available", features: ["PCs", "Projector", "Air Conditioning"], department: "Management Sciences" },

  // Admin Block
  { id: "ab-101", name: "Conference Room", type: "classroom", building: "Admin Block", floor: 1, capacity: 20, status: "available", features: ["Video Conferencing", "Projector", "Whiteboard"], department: "Computer Science" },
  { id: "ab-201", name: "Seminar Hall", type: "classroom", building: "Admin Block", floor: 2, capacity: 80, status: "occupied", features: ["Stage", "Mic System", "Projector", "Recording"], department: "Computer Science" },
];

const MOCK_POOL_STATE: ResourcePoolState = {
  total_slots: 80,
  allocated_slots: 34,
  free_slots: 46,
  fragmentation_pct: 28.5,
  bitmap: Array.from({ length: 80 }, (_, i) => {
    const pattern = [
      true, true, false, true, false, false, true, true, false, false,
      true, false, false, true, true, true, false, false, false, true,
      false, true, true, false, true, false, false, false, true, true,
      true, true, false, false, true, false, true, false, false, false,
      true, true, true, false, false, true, false, false, true, false,
      false, true, true, true, false, false, false, true, false, true,
      true, false, false, false, true, true, false, true, false, false,
      false, true, true, false, false, true, false, false, true, true,
    ];
    return pattern[i];
  }),
  allocation_map: [
    { slot: 0, booking_id: "b1", resource_name: "CS Lab 1" },
    { slot: 1, booking_id: "b1", resource_name: "CS Lab 1" },
    { slot: 3, booking_id: "b2", resource_name: "Room 201" },
    { slot: 6, booking_id: "b3", resource_name: "AI Lab" },
    { slot: 7, booking_id: "b3", resource_name: "AI Lab" },
    { slot: 10, booking_id: "b4", resource_name: "Circuits Lab" },
    { slot: 13, booking_id: "b5", resource_name: "Lecture Hall A" },
    { slot: 14, booking_id: "b5", resource_name: "Lecture Hall A" },
    { slot: 15, booking_id: "b5", resource_name: "Lecture Hall A" },
    { slot: 19, booking_id: "b6", resource_name: "Room 202" },
    { slot: 21, booking_id: "b7", resource_name: "Seminar Hall" },
    { slot: 22, booking_id: "b7", resource_name: "Seminar Hall" },
    { slot: 24, booking_id: "b8", resource_name: "SE Lab" },
    { slot: 28, booking_id: "b9", resource_name: "DSP Lab" },
    { slot: 29, booking_id: "b9", resource_name: "DSP Lab" },
    { slot: 30, booking_id: "b10", resource_name: "Room 302" },
    { slot: 31, booking_id: "b10", resource_name: "Room 302" },
    { slot: 34, booking_id: "b11", resource_name: "Power Lab" },
    { slot: 36, booking_id: "b12", resource_name: "Networking Lab" },
    { slot: 40, booking_id: "b13", resource_name: "CS Lab 2" },
    { slot: 41, booking_id: "b13", resource_name: "CS Lab 2" },
    { slot: 42, booking_id: "b13", resource_name: "CS Lab 2" },
    { slot: 45, booking_id: "b14", resource_name: "Room 203" },
    { slot: 48, booking_id: "b15", resource_name: "EE Room 201" },
    { slot: 51, booking_id: "b16", resource_name: "Computer Lab" },
    { slot: 52, booking_id: "b16", resource_name: "Computer Lab" },
    { slot: 53, booking_id: "b16", resource_name: "Computer Lab" },
    { slot: 57, booking_id: "b17", resource_name: "Conference Room" },
    { slot: 59, booking_id: "b18", resource_name: "NB Room 201" },
    { slot: 60, booking_id: "b18", resource_name: "NB Room 201" },
    { slot: 64, booking_id: "b19", resource_name: "NB Room 202" },
    { slot: 65, booking_id: "b19", resource_name: "NB Room 202" },
    { slot: 67, booking_id: "b20", resource_name: "EE Room 202" },
    { slot: 71, booking_id: "b21", resource_name: "Lecture Hall B" },
  ],
};

export const useResources = create<ResourcesState>((set, get) => ({
  resources: [],
  poolState: null,
  selectedBuilding: "CS Block",
  selectedFloor: null,
  selectedResource: null,
  typeFilter: "all",
  statusFilter: "all",
  searchQuery: "",
  isLoading: false,
  isCompacting: false,

  fetchResources: async () => {
    set({ isLoading: true });
    try {
      const res = await resourcesApi.getAll();
      set({ resources: res.data, isLoading: false });
    } catch {
      // Fallback to mock data
      set({ resources: MOCK_RESOURCES, isLoading: false });
    }
  },

  fetchPoolState: async () => {
    try {
      const res = await resourcesApi.getPoolState();
      set({ poolState: res.data });
    } catch {
      set({ poolState: MOCK_POOL_STATE });
    }
  },

  compact: async () => {
    set({ isCompacting: true });
    // Simulate compaction delay
    await new Promise((r) => setTimeout(r, 1500));
    const pool = get().poolState;
    if (pool) {
      const compactedBitmap = [
        ...Array(pool.allocated_slots).fill(true),
        ...Array(pool.free_slots).fill(false),
      ];
      set({
        poolState: {
          ...pool,
          bitmap: compactedBitmap,
          fragmentation_pct: 0,
        },
        isCompacting: false,
      });
    } else {
      set({ isCompacting: false });
    }
  },

  selectResource: (resource) => set({ selectedResource: resource }),
  setSelectedBuilding: (building) => set({ selectedBuilding: building, selectedFloor: null }),
  setSelectedFloor: (floor) => set({ selectedFloor: floor }),
  setTypeFilter: (type) => set({ typeFilter: type }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));

export default useResources;
