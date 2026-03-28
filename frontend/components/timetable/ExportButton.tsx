"use client";

import { useState, useRef, useEffect } from "react";
import { Download, FileText, FileSpreadsheet, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { TimetableEntry } from "@/types";

interface ExportButtonProps {
  entries: TimetableEntry[];
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function ExportButton({ entries }: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const exportCSV = () => {
    const headers = ["Day", "Start Time", "End Time", "Course Code", "Title", "Faculty", "Room", "Department"];
    const rows = entries.map((e) => [
      DAYS[e.day_of_week - 1] || `Day ${e.day_of_week}`,
      e.start_time,
      e.end_time,
      e.course_code,
      e.title,
      e.faculty_name,
      e.resource_name,
      e.department,
    ]);

    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "timetable.csv";
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  const exportPDF = async () => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF({ orientation: "landscape" });

      // Title
      doc.setFontSize(18);
      doc.setTextColor(15, 17, 23);
      doc.text("CUIScheduler - Weekly Timetable", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("COMSATS University Islamabad, Wah Campus", 14, 28);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 34);

      // Table
      const tableData = entries
        .sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time))
        .map((e) => [
          DAYS[e.day_of_week - 1] || `Day ${e.day_of_week}`,
          `${e.start_time} - ${e.end_time}`,
          e.course_code,
          e.title,
          e.faculty_name,
          e.resource_name,
          e.department,
        ]);

      autoTable(doc, {
        startY: 40,
        head: [["Day", "Time", "Code", "Title", "Faculty", "Room", "Department"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [79, 142, 247],
          textColor: 255,
          fontSize: 9,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [30, 36, 53],
        },
        alternateRowStyles: {
          fillColor: [245, 247, 255],
        },
        margin: { left: 14, right: 14 },
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `CUIScheduler | OS Course Project | Page ${i} of ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      doc.save("timetable.pdf");
    } catch (err) {
      console.error("PDF export failed:", err);
    }
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium",
          "bg-bg-tertiary border border-border text-text-secondary",
          "hover:text-text-primary hover:border-border-light transition-colors"
        )}
      >
        <Download size={14} />
        Export
        <ChevronDown size={12} className={cn("transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 rounded-lg border border-border bg-bg-secondary shadow-lg z-50 overflow-hidden">
          <button
            onClick={exportPDF}
            className="flex items-center gap-2 w-full px-3 py-2.5 text-[12px] text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors"
          >
            <FileText size={14} className="text-danger" />
            Export as PDF
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 w-full px-3 py-2.5 text-[12px] text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors border-t border-border"
          >
            <FileSpreadsheet size={14} className="text-success" />
            Export as CSV
          </button>
        </div>
      )}
    </div>
  );
}

export default ExportButton;
