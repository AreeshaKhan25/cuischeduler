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

// No mock data — all resources come from the database

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
      set({ resources: [], isLoading: false });
    }
  },

  fetchPoolState: async () => {
    try {
      const res = await resourcesApi.getPoolState();
      set({ poolState: res.data });
    } catch {
      set({ poolState: null });
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
