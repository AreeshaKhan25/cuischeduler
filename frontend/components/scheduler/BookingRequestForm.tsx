"use client";

import { useState } from "react";
import * as Slider from "@radix-ui/react-slider";
import { motion } from "framer-motion";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";
import { OS_CONCEPTS } from "@/constants/osConcepts";
import { GlowCard } from "@/components/ui/GlowCard";
import { useScheduler, generateBooking } from "@/hooks/useScheduler";
import { cn } from "@/lib/utils";
import {
  Plus,
  Shuffle,
  Database,
  BookOpen,
  Monitor,
  GraduationCap,
  FileText,
  User,
} from "lucide-react";
import type { ResourceType } from "@/types";

const COURSES = [
  { code: "CS-301", name: "Operating Systems" },
  { code: "CS-201", name: "Object Oriented Programming" },
  { code: "CS-401", name: "Database Systems" },
  { code: "CS-101", name: "Intro to Computing" },
  { code: "CS-501", name: "Machine Learning" },
  { code: "EE-201", name: "Digital Logic Design" },
  { code: "MT-301", name: "Linear Algebra" },
  { code: "CS-601", name: "Computer Networks" },
];

const RESOURCE_TYPES: { value: ResourceType; label: string; icon: React.ElementType }[] = [
  { value: "classroom", label: "Classroom", icon: BookOpen },
  { value: "lab", label: "Lab", icon: Monitor },
  { value: "faculty", label: "Faculty", icon: GraduationCap },
  { value: "exam_slot", label: "Exam Slot", icon: FileText },
];

const FACULTIES = [
  { id: "fac-1", name: "Dr. Ahmed Khan" },
  { id: "fac-2", name: "Dr. Sara Malik" },
  { id: "fac-3", name: "Prof. Usman Ali" },
  { id: "fac-4", name: "Dr. Fatima Noor" },
  { id: "fac-5", name: "Prof. Bilal Shah" },
];

interface BookingRequestFormProps {
  className?: string;
}

export function BookingRequestForm({ className }: BookingRequestFormProps) {
  const { addToQueue, addRandomBookings, loadDemoSet } = useScheduler();

  const [courseCode, setCourseCode] = useState(COURSES[0].code);
  const [resourceType, setResourceType] = useState<ResourceType>("classroom");
  const [duration, setDuration] = useState(60);
  const [priority, setPriority] = useState(5);
  const [date, setDate] = useState("2026-03-28");
  const [faculty, setFaculty] = useState(FACULTIES[0].id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const course = COURSES.find((c) => c.code === courseCode)!;
    const fac = FACULTIES.find((f) => f.id === faculty)!;

    const booking = generateBooking({
      title: `${course.name} Session`,
      course_code: course.code,
      resource_type: resourceType,
      duration_minutes: duration,
      priority,
      date,
      faculty_id: fac.id,
      requested_by: fac.name,
      arrival_time: Math.floor(Math.random() * 15),
    });

    addToQueue(booking);
  };

  return (
    <GlowCard glowColor="blue" className={cn("", className)}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-[16px] font-display font-bold text-text-primary">
              New Booking Request
            </h3>
            <OSConceptBadge
              concept={OS_CONCEPTS.PCB.name}
              chapter={OS_CONCEPTS.PCB.chapter}
              description={OS_CONCEPTS.PCB.description}
              size="sm"
              pulse={false}
            />
          </div>
        </div>

        {/* Course Code */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-text-secondary uppercase tracking-wider">
            Course Code
          </label>
          <select
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            className={cn(
              "w-full rounded-lg border border-border bg-bg-primary px-3 py-2.5",
              "text-[13px] text-text-primary font-mono",
              "focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30",
              "transition-colors duration-150"
            )}
          >
            {COURSES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Resource Type */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-text-secondary uppercase tracking-wider">
            Resource Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {RESOURCE_TYPES.map((rt) => {
              const Icon = rt.icon;
              const isActive = resourceType === rt.value;
              return (
                <button
                  key={rt.value}
                  type="button"
                  onClick={() => setResourceType(rt.value)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-lg border text-[12px] font-medium",
                    "transition-all duration-150",
                    isActive
                      ? "border-accent-blue bg-accent-blue-soft text-accent-blue"
                      : "border-border bg-bg-primary text-text-secondary hover:border-border-light hover:text-text-primary"
                  )}
                >
                  <Icon size={14} />
                  {rt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration (Burst Time) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-[12px] font-medium text-text-secondary uppercase tracking-wider">
                Duration
              </label>
              <OSConceptBadge
                concept="Burst Time"
                description="The total CPU time required by a process to complete execution. In scheduling, this determines execution order for SJF."
                chapter="Ch.5"
                size="sm"
                pulse={false}
              />
            </div>
            <span className="font-mono text-[13px] font-semibold text-accent-blue">
              {duration} min
            </span>
          </div>
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={[duration]}
            onValueChange={([v]) => setDuration(v)}
            min={30}
            max={180}
            step={15}
          >
            <Slider.Track className="bg-bg-primary border border-border relative grow rounded-full h-[6px]">
              <Slider.Range className="absolute bg-gradient-to-r from-accent-blue to-accent-teal rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb
              className={cn(
                "block w-5 h-5 rounded-full",
                "bg-accent-blue border-2 border-bg-primary shadow-blue-glow",
                "hover:bg-accent-teal transition-colors duration-150",
                "focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
              )}
            />
          </Slider.Root>
          <div className="flex justify-between text-[10px] font-mono text-text-tertiary">
            <span>30m</span>
            <span>90m</span>
            <span>180m</span>
          </div>
        </div>

        {/* Priority (Process Priority) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-[12px] font-medium text-text-secondary uppercase tracking-wider">
                Priority
              </label>
              <OSConceptBadge
                concept="Process Priority"
                description="Higher priority processes are scheduled first in priority scheduling. Range 1 (lowest) to 10 (highest)."
                chapter="Ch.5"
                size="sm"
                pulse={false}
              />
            </div>
            <span
              className={cn(
                "font-mono text-[13px] font-semibold px-2 py-0.5 rounded-md",
                priority >= 8
                  ? "text-danger bg-danger-soft"
                  : priority >= 5
                  ? "text-warning bg-warning-soft"
                  : "text-success bg-success-soft"
              )}
            >
              {priority}
            </span>
          </div>
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={[priority]}
            onValueChange={([v]) => setPriority(v)}
            min={1}
            max={10}
            step={1}
          >
            <Slider.Track className="bg-bg-primary border border-border relative grow rounded-full h-[6px]">
              <Slider.Range className="absolute bg-gradient-to-r from-success via-warning to-danger rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb
              className={cn(
                "block w-5 h-5 rounded-full border-2 border-bg-primary shadow-blue-glow",
                priority >= 8 ? "bg-danger" : priority >= 5 ? "bg-warning" : "bg-success",
                "focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
              )}
            />
          </Slider.Root>
          <div className="flex justify-between text-[10px] font-mono text-text-tertiary">
            <span>1 (Low)</span>
            <span>5</span>
            <span>10 (High)</span>
          </div>
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-text-secondary uppercase tracking-wider">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={cn(
              "w-full rounded-lg border border-border bg-bg-primary px-3 py-2.5",
              "text-[13px] text-text-primary font-mono",
              "focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30",
              "transition-colors duration-150",
              "[color-scheme:dark]"
            )}
          />
        </div>

        {/* Faculty */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <User size={12} />
            Faculty
          </label>
          <select
            value={faculty}
            onChange={(e) => setFaculty(e.target.value)}
            className={cn(
              "w-full rounded-lg border border-border bg-bg-primary px-3 py-2.5",
              "text-[13px] text-text-primary font-mono",
              "focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30",
              "transition-colors duration-150"
            )}
          >
            {FACULTIES.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg",
            "bg-accent-blue text-white font-medium text-[14px]",
            "hover:bg-accent-blue/90 active:bg-accent-blue/80",
            "shadow-blue-glow transition-all duration-200",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50"
          )}
        >
          <Plus size={18} />
          Add to Ready Queue
        </motion.button>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2 border-t border-border/50">
          <button
            type="button"
            onClick={() => addRandomBookings(5)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg",
              "border border-border bg-bg-primary text-text-secondary",
              "text-[12px] font-medium",
              "hover:border-border-light hover:text-text-primary hover:bg-bg-tertiary",
              "transition-all duration-150"
            )}
          >
            <Shuffle size={13} />
            Add 5 Random
          </button>
          <button
            type="button"
            onClick={loadDemoSet}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg",
              "border border-os-border/40 bg-os-bg/30 text-os-text",
              "text-[12px] font-medium font-mono",
              "hover:bg-os-bg/50 hover:border-os-border/60",
              "transition-all duration-150"
            )}
          >
            <Database size={13} />
            Load Demo Set
          </button>
        </div>
      </form>
    </GlowCard>
  );
}

export default BookingRequestForm;
