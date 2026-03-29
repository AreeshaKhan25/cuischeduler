"use client";

import { useState } from "react";
import { Wand2, Loader2, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { timetableApi } from "@/lib/api";
import { FEATURE_OS_MAP } from "@/constants/cuiData";

interface ScheduleResult {
  placed: number;
  failed: number;
  total: number;
  failures: { courseOfferingId: number; courseName: string; sectionName: string; reason: string }[];
  osNote: string;
}

export default function AutoSchedulePage() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<ScheduleResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAutoSchedule() {
    setIsRunning(true);
    setResult(null);
    setError(null);
    try {
      const res = await timetableApi.autoSchedule({ clear: true });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to run auto-scheduler");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-display font-bold text-text-primary">Auto-Schedule</h1>
        <p className="text-sm text-text-secondary mt-1">
          Generate the complete timetable for all sections with one click.
          The system uses a constraint-based algorithm to assign rooms, times, and days.
        </p>
      </div>

      {/* Action card */}
      <div className="bg-bg-secondary border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent-blue/10 border border-accent-blue/20">
            <Wand2 size={24} className="text-accent-blue" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-text-primary">Generate Timetable</h2>
            <p className="text-sm text-text-tertiary mt-1">
              This will clear the existing timetable and generate a new one based on all course offerings.
              Labs are scheduled first (most constrained), followed by large-section classes.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={runAutoSchedule}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Wand2 size={16} />
                Generate Timetable
              </>
            )}
          </button>
          {result && (
            <button
              onClick={runAutoSchedule}
              className="flex items-center gap-2 px-4 py-2.5 text-sm bg-bg-primary border border-border rounded-lg text-text-secondary hover:bg-bg-hover transition-colors"
            >
              <RefreshCw size={14} />
              Re-generate
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <AlertTriangle size={18} className="text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Summary */}
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${
            result.failed === 0
              ? "bg-green-500/10 border-green-500/30"
              : "bg-yellow-500/10 border-yellow-500/30"
          }`}>
            <CheckCircle size={20} className={result.failed === 0 ? "text-green-400" : "text-yellow-400"} />
            <div>
              <p className="text-sm font-medium text-text-primary">
                {result.placed} of {result.total} classes scheduled successfully
              </p>
              {result.failed > 0 && (
                <p className="text-xs text-yellow-400 mt-0.5">
                  {result.failed} class{result.failed !== 1 ? "es" : ""} could not be placed
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-bg-secondary border border-border rounded-xl text-center">
              <p className="text-2xl font-bold text-green-400">{result.placed}</p>
              <p className="text-xs text-text-tertiary">Placed</p>
            </div>
            <div className="p-3 bg-bg-secondary border border-border rounded-xl text-center">
              <p className="text-2xl font-bold text-red-400">{result.failed}</p>
              <p className="text-xs text-text-tertiary">Failed</p>
            </div>
            <div className="p-3 bg-bg-secondary border border-border rounded-xl text-center">
              <p className="text-2xl font-bold text-text-primary">{result.total}</p>
              <p className="text-xs text-text-tertiary">Total</p>
            </div>
          </div>

          {/* Failures */}
          {result.failures.length > 0 && (
            <div className="bg-bg-secondary border border-border rounded-xl p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-2">Failed Placements</h3>
              <div className="space-y-2">
                {result.failures.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-red-500/5 border border-red-500/10 rounded-lg">
                    <AlertTriangle size={12} className="text-red-400 flex-shrink-0" />
                    <div className="text-sm">
                      <span className="text-text-primary font-medium">{f.courseName}</span>
                      <span className="text-text-tertiary"> ({f.sectionName})</span>
                      <span className="text-text-tertiary"> — {f.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* OS Concept Note */}
          <div className="p-3 bg-bg-secondary border border-border/50 rounded-lg">
            <p className="text-[10px] font-mono text-text-tertiary">
              OS Concept: {result.osNote}
            </p>
          </div>

          {/* Link to timetable */}
          <a
            href="/timetable"
            className="block text-center px-4 py-2.5 text-sm bg-accent-blue/10 text-accent-blue border border-accent-blue/20 rounded-lg hover:bg-accent-blue/20 transition-colors"
          >
            View Generated Timetable →
          </a>
        </div>
      )}
    </div>
  );
}
