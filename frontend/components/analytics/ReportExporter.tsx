"use client";

import { useState } from "react";
import { FileOutput, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnalyticsData, AlgorithmComparison } from "@/types";
import { OS_CONCEPTS, OSConceptKey } from "@/constants/osConcepts";

interface ReportExporterProps {
  data: AnalyticsData;
}

export function ReportExporter({ data }: ReportExporterProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportReport = async () => {
    setIsExporting(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF();
      const pageW = doc.internal.pageSize.getWidth();

      // ─── Header ─────────────────────────────────────────
      doc.setFillColor(15, 17, 23);
      doc.rect(0, 0, pageW, 45, "F");

      doc.setTextColor(240, 244, 255);
      doc.setFontSize(20);
      doc.text("CUIScheduler Analytics Report", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(136, 146, 170);
      doc.text("COMSATS University Islamabad, Wah Campus", 14, 28);
      doc.text(`Generated: ${new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`, 14, 35);

      let y = 55;

      // ─── Summary Stats ───────────────────────────────────
      doc.setTextColor(30, 36, 53);
      doc.setFontSize(14);
      doc.text("Summary Statistics", 14, y);
      y += 8;

      const totalResources = data.utilization.length;
      const avgUtil = data.utilization.reduce((s, r) => s + r.utilization_pct, 0) / totalResources;
      const overloaded = data.faculty_load.filter((f) => f.hours > f.max_hours).length;
      const totalBookings = data.heatmap.flat().reduce((s, v) => s + v, 0);

      autoTable(doc, {
        startY: y,
        head: [["Metric", "Value"]],
        body: [
          ["Total Resources", String(totalResources)],
          ["Average Utilization", `${avgUtil.toFixed(1)}%`],
          ["Total Weekly Bookings", String(totalBookings)],
          ["Overloaded Faculty", `${overloaded} of ${data.faculty_load.length}`],
          ["Peak Fragmentation", `${data.fragmentation_history[data.fragmentation_history.length - 1]?.fragmentation_pct?.toFixed(1) ?? "N/A"}%`],
        ],
        theme: "grid",
        headStyles: { fillColor: [79, 142, 247], textColor: 255, fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
        tableWidth: "auto",
      });

      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;

      // ─── Algorithm Recommendation ────────────────────────
      doc.setFontSize(14);
      doc.text("Algorithm Recommendation", 14, y);
      y += 8;

      const bestAlgo = [...data.algorithm_comparison].sort(
        (a, b) => a.avg_waiting_time - b.avg_waiting_time
      )[0];

      autoTable(doc, {
        startY: y,
        head: [["Algorithm", "Avg Wait", "Avg Turnaround", "CPU Util", "Context Switches", "Best For"]],
        body: data.algorithm_comparison.map((a) => [
          a.algorithm,
          `${a.avg_waiting_time.toFixed(1)} min`,
          `${a.avg_turnaround_time.toFixed(1)} min`,
          `${a.cpu_utilization.toFixed(1)}%`,
          String(a.context_switches),
          a.best_for,
        ]),
        theme: "grid",
        headStyles: { fillColor: [79, 142, 247], textColor: 255, fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 14, right: 14 },
      });

      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

      doc.setFontSize(10);
      doc.setTextColor(34, 197, 94);
      doc.text(
        `Recommended: ${bestAlgo.algorithm} - Lowest average waiting time (${bestAlgo.avg_waiting_time.toFixed(1)} min)`,
        14,
        y
      );
      y += 12;

      // ─── Resource Utilization ────────────────────────────
      if (y > 240) {
        doc.addPage();
        y = 20;
      }

      doc.setTextColor(30, 36, 53);
      doc.setFontSize(14);
      doc.text("Resource Utilization", 14, y);
      y += 8;

      const sortedUtil = [...data.utilization].sort((a, b) => b.utilization_pct - a.utilization_pct);
      autoTable(doc, {
        startY: y,
        head: [["Resource", "Utilization", "Status"]],
        body: sortedUtil.map((r) => [
          r.resource_name,
          `${r.utilization_pct.toFixed(1)}%`,
          r.utilization_pct >= 80 ? "Critical" : r.utilization_pct >= 60 ? "High" : "Normal",
        ]),
        theme: "grid",
        headStyles: { fillColor: [79, 142, 247], textColor: 255, fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
      });

      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;

      // ─── OS Concept Glossary ─────────────────────────────
      doc.addPage();
      y = 20;

      doc.setTextColor(30, 36, 53);
      doc.setFontSize(14);
      doc.text("OS Concept Glossary", 14, y);
      y += 8;

      const conceptKeys: OSConceptKey[] = [
        "FCFS", "SJF", "ROUND_ROBIN", "PRIORITY",
        "MEMORY_BITMAP", "FRAGMENTATION", "LOAD_BALANCE",
        "DEADLOCK_RAG", "BANKERS", "SEMAPHORE", "MUTEX",
      ];

      autoTable(doc, {
        startY: y,
        head: [["Concept", "Chapter", "Description"]],
        body: conceptKeys.map((key) => {
          const c = OS_CONCEPTS[key];
          return [c.name, c.chapter, c.description];
        }),
        theme: "grid",
        headStyles: { fillColor: [127, 29, 29], textColor: 255, fontSize: 9 },
        bodyStyles: { fontSize: 8, cellWidth: "wrap" },
        columnStyles: { 2: { cellWidth: 100 } },
        margin: { left: 14, right: 14 },
      });

      // ─── Footer on all pages ─────────────────────────────
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `CUIScheduler Analytics Report | OS Course Project | Page ${i} of ${pageCount}`,
          pageW / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      doc.save("cuischeduler-analytics-report.pdf");
    } catch (err) {
      console.error("Report export failed:", err);
    }
    setIsExporting(false);
  };

  return (
    <button
      onClick={exportReport}
      disabled={isExporting}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium",
        "transition-all duration-200",
        isExporting
          ? "bg-bg-tertiary text-text-tertiary cursor-not-allowed"
          : "bg-accent-blue/10 text-accent-blue border border-accent-blue/30 hover:bg-accent-blue/20 hover:shadow-blue-glow"
      )}
    >
      {isExporting ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <FileOutput size={16} />
      )}
      {isExporting ? "Generating Report..." : "Export Analytics Report"}
    </button>
  );
}

export default ReportExporter;
