"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Download, CalendarDays, User, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { timetableApi, sectionsApi, resourcesApi } from "@/lib/api";
import { SectionTimetableGrid } from "@/components/timetable/SectionTimetableGrid";
import { TimetableEntry, Section, Resource } from "@/types";
import { FEATURE_OS_MAP } from "@/constants/cuiData";

type FilterMode = "section" | "faculty" | "room";

export default function TimetablePage() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [semesterInfo, setSemesterInfo] = useState<{ id: number; code: string; name: string } | null>(null);

  const [filterMode, setFilterMode] = useState<FilterMode>("section");
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");
  const [selectedResourceId, setSelectedResourceId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);

  // Load sections and resources on mount
  useEffect(() => {
    Promise.all([
      sectionsApi.getAll(),
      resourcesApi.getAll(),
    ]).then(([secRes, resRes]) => {
      setSections(secRes.data);
      setResources(resRes.data);
      // Auto-select first section
      if (secRes.data.length > 0) {
        setSelectedSectionId(secRes.data[0].id);
      }
    });
  }, []);

  // Fetch timetable entries when filter changes
  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (filterMode === "section" && selectedSectionId) params.section_id = selectedSectionId;
      if (filterMode === "faculty" && selectedFacultyId) params.faculty_id = selectedFacultyId;
      if (filterMode === "room" && selectedResourceId) params.resource_id = selectedResourceId;

      const res = await timetableApi.get(params);
      setEntries(res.data.entries || []);
      setSemesterInfo(res.data.semester);
    } catch (err) {
      console.error("Failed to fetch timetable:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filterMode, selectedSectionId, selectedFacultyId, selectedResourceId]);

  useEffect(() => {
    if (selectedSectionId || selectedFacultyId || selectedResourceId) {
      fetchEntries();
    }
  }, [fetchEntries, selectedSectionId, selectedFacultyId, selectedResourceId]);

  const selectedSection = sections.find((s) => s.id === selectedSectionId);
  const classrooms = resources.filter((r) => r.type === "classroom" || r.type === "lab");

  // Get unique faculty from entries for faculty filter
  const [allFaculty, setAllFaculty] = useState<{ id: number; name: string }[]>([]);
  useEffect(() => {
    timetableApi.get({}).then((res) => {
      const facs = new Map<number, string>();
      for (const e of res.data.entries || []) {
        const f = e.courseOffering?.faculty;
        if (f) facs.set(f.id, f.name);
      }
      setAllFaculty(Array.from(facs.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name)));
    });
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-text-primary">Timetable</h1>
          {semesterInfo && (
            <p className="text-sm text-text-secondary mt-0.5">
              {semesterInfo.name} ({semesterInfo.code})
            </p>
          )}
        </div>
        <button
          className="flex items-center gap-2 px-3 py-2 text-sm bg-bg-secondary border border-border rounded-lg hover:bg-bg-hover transition-colors text-text-secondary"
          onClick={() => window.print()}
        >
          <Download size={14} />
          Export
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-bg-secondary border border-border rounded-lg">
        {/* Filter mode tabs */}
        <div className="flex rounded-lg border border-border overflow-hidden">
          {([
            { mode: "section" as FilterMode, icon: CalendarDays, label: "Section" },
            { mode: "faculty" as FilterMode, icon: User, label: "Faculty" },
            { mode: "room" as FilterMode, icon: Building2, label: "Room" },
          ]).map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
                filterMode === mode
                  ? "bg-accent-blue text-white"
                  : "bg-bg-primary text-text-secondary hover:bg-bg-hover"
              )}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Filter dropdown */}
        {filterMode === "section" && (
          <select
            value={selectedSectionId || ""}
            onChange={(e) => setSelectedSectionId(parseInt(e.target.value))}
            className="px-3 py-1.5 text-sm bg-bg-primary border border-border rounded-lg text-text-primary"
          >
            <option value="">Select Section</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}
        {filterMode === "faculty" && (
          <select
            value={selectedFacultyId}
            onChange={(e) => setSelectedFacultyId(e.target.value)}
            className="px-3 py-1.5 text-sm bg-bg-primary border border-border rounded-lg text-text-primary"
          >
            <option value="">Select Faculty</option>
            {allFaculty.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        )}
        {filterMode === "room" && (
          <select
            value={selectedResourceId}
            onChange={(e) => setSelectedResourceId(e.target.value)}
            className="px-3 py-1.5 text-sm bg-bg-primary border border-border rounded-lg text-text-primary"
          >
            <option value="">Select Room</option>
            {classrooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.type})
              </option>
            ))}
          </select>
        )}

        {/* Section info */}
        {filterMode === "section" && selectedSection && (
          <span className="text-xs text-text-tertiary ml-auto">
            {selectedSection.program} &middot; Sem {selectedSection.semester} &middot; {selectedSection.strength} students
          </span>
        )}
      </div>

      {/* Timetable Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-accent-blue" size={24} />
          <span className="ml-2 text-sm text-text-secondary">Loading timetable...</span>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20 text-text-tertiary">
          <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No classes scheduled yet.</p>
          <p className="text-xs mt-1">Admin can run Auto-Schedule to generate the timetable.</p>
        </div>
      ) : (
        <SectionTimetableGrid
          entries={entries}
          onCellClick={(entry) => setSelectedEntry(entry)}
        />
      )}

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setSelectedEntry(null)}
        >
          <div
            className="bg-bg-secondary border border-border rounded-xl p-6 max-w-md w-full mx-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-text-primary">
              {selectedEntry.courseOffering?.course?.code} — {selectedEntry.courseOffering?.course?.name}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-tertiary">Section</span>
                <span className="text-text-primary">{selectedEntry.courseOffering?.section?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Faculty</span>
                <span className="text-text-primary">{selectedEntry.courseOffering?.faculty?.name || "TBD"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Room</span>
                <span className="text-text-primary">{selectedEntry.resource?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Day & Time</span>
                <span className="text-text-primary">
                  {selectedEntry.dayOfWeek}, {selectedEntry.startTime} - {selectedEntry.endTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Type</span>
                <span className="text-text-primary">{selectedEntry.isLab ? "Lab" : "Lecture"}</span>
              </div>
            </div>

            {/* OS Concept annotation (subtle) */}
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-[10px] font-mono text-text-tertiary">
                OS: {FEATURE_OS_MAP.roomAllocation.description}
              </p>
            </div>

            <div className="flex gap-2 mt-4">
              <a
                href={`/requests?entry=${selectedEntry.id}`}
                className="flex-1 px-3 py-2 text-sm text-center bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors"
              >
                Request Change
              </a>
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-2 text-sm bg-bg-primary border border-border rounded-lg text-text-secondary hover:bg-bg-hover transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
