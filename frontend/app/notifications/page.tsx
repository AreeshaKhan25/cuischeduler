"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { GlowCard } from "@/components/ui/GlowCard";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";
import { LivePulse } from "@/components/ui/LivePulse";
import { OS_CONCEPTS } from "@/constants/osConcepts";
import { notificationsApi } from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { IPCMessage } from "@/types";
import toast from "react-hot-toast";
import {
  Mail,
  MailOpen,
  Send,
  Inbox,
  Filter,
  CheckCheck,
  Bell,
  ArrowRight,
  Layers,
  Clock,
  X,
  ChevronDown,
  MessageSquare,
  AlertTriangle,
  CalendarCheck,
  Radio,
  Unlock,
} from "lucide-react";

/* ─── Type color mapping ─────────────────────────────────────── */
const MSG_TYPE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; icon: typeof Mail }
> = {
  booking_confirmed: {
    label: "Confirmed",
    color: "text-success",
    bg: "bg-success-soft",
    border: "border-success/30",
    icon: CalendarCheck,
  },
  conflict: {
    label: "Conflict",
    color: "text-danger",
    bg: "bg-danger-soft",
    border: "border-danger/30",
    icon: AlertTriangle,
  },
  resource_freed: {
    label: "Freed",
    color: "text-accent-teal",
    bg: "bg-accent-teal-soft",
    border: "border-accent-teal/30",
    icon: Unlock,
  },
  exam_scheduled: {
    label: "Exam",
    color: "text-warning",
    bg: "bg-warning-soft",
    border: "border-warning/30",
    icon: CalendarCheck,
  },
  broadcast: {
    label: "Broadcast",
    color: "text-accent-blue",
    bg: "bg-accent-blue-soft",
    border: "border-accent-blue/30",
    icon: Radio,
  },
};

/* ─── Demo data ──────────────────────────────────────────────── */
const DEMO_MESSAGES: IPCMessage[] = [
  {
    id: "msg-1",
    from_department: "Computer Science",
    to_department: "Electrical Engineering",
    type: "booking_confirmed",
    subject: "Room CS-201 confirmed for OS Lab",
    body: "Your booking for CS-201 on Monday 9:00-10:30 AM has been confirmed via FCFS scheduling.",
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    os_concept: "IPC Message Passing — asynchronous notification delivered to department mailbox",
  },
  {
    id: "msg-2",
    from_department: "Admin Office",
    to_department: "Computer Science",
    type: "conflict",
    subject: "Double-booking detected for Lab-3",
    body: "Deadlock detected: CS-302 and SE-201 both hold partial resources. Banker's algorithm invoked.",
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    os_concept: "IPC used to notify processes of deadlock detection — signal() to waiting queue",
  },
  {
    id: "msg-3",
    from_department: "Mechanical Engineering",
    to_department: "All Departments",
    type: "broadcast",
    subject: "Workshop Hall available for booking",
    body: "Workshop Hall (capacity 120) is now available after maintenance. First-come-first-served.",
    read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    os_concept: "Broadcast IPC — message sent to all process groups (departments)",
  },
  {
    id: "msg-4",
    from_department: "Exam Cell",
    to_department: "Computer Science",
    type: "exam_scheduled",
    subject: "Final Exam: Operating Systems",
    body: "OS final exam scheduled for Hall-A, Dec 15, 2:00-5:00 PM. Priority level: HIGHEST.",
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    os_concept: "High-priority message — preempts normal scheduling queue",
  },
  {
    id: "msg-5",
    from_department: "Computer Science",
    to_department: "Admin Office",
    type: "resource_freed",
    subject: "Lab-2 released after session end",
    body: "Lab-2 semaphore signaled: count incremented from 0 to 1. Next waiting process can acquire.",
    read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
    os_concept: "Resource release triggers signal() on semaphore — wakes blocked process",
  },
  {
    id: "msg-6",
    from_department: "Electrical Engineering",
    to_department: "Computer Science",
    type: "booking_confirmed",
    subject: "Shared Lab session approved",
    body: "Cross-department lab sharing approved. Mutex acquired for time slot 2:00-3:30 PM.",
    read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    os_concept: "IPC enables cross-process communication for shared resource coordination",
  },
  {
    id: "msg-7",
    from_department: "Admin Office",
    to_department: "All Departments",
    type: "broadcast",
    subject: "System maintenance window scheduled",
    body: "Scheduler will be offline Sunday 2:00-4:00 AM for Round Robin quantum optimization.",
    read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
    os_concept: "System-wide broadcast — kernel notification to all user-space processes",
  },
];

/* ─── Queue visualizer message type ─────────────────────────── */
interface QueueMsg {
  id: string;
  label: string;
  type: string;
  color: string;
}

const QUEUE_MSGS: QueueMsg[] = [
  { id: "q1", label: "CONF", type: "booking_confirmed", color: "#22c55e" },
  { id: "q2", label: "ALRT", type: "conflict", color: "#ef4444" },
  { id: "q3", label: "FREE", type: "resource_freed", color: "#2dd4bf" },
  { id: "q4", label: "EXAM", type: "exam_scheduled", color: "#f59e0b" },
  { id: "q5", label: "CAST", type: "broadcast", color: "#4f8ef7" },
];

type FilterType = "all" | "unread" | "booking_confirmed" | "conflict" | "resource_freed" | "exam_scheduled" | "broadcast";

export default function NotificationsPage() {
  const [messages, setMessages] = useState<IPCMessage[]>(DEMO_MESSAGES);
  const [filter, setFilter] = useState<FilterType>("all");
  const [composeOpen, setComposeOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<IPCMessage | null>(null);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  /* Queue animation state */
  const [queueItems, setQueueItems] = useState<QueueMsg[]>(QUEUE_MSGS.slice(0, 3));
  const [producerMsg, setProducerMsg] = useState<QueueMsg | null>(null);
  const [consumerMsg, setConsumerMsg] = useState<QueueMsg | null>(null);

  useEffect(() => {
    let idx = 3;
    const interval = setInterval(() => {
      const newMsg = QUEUE_MSGS[idx % QUEUE_MSGS.length];
      const withId = { ...newMsg, id: `q-${Date.now()}` };

      // Producer sends
      setProducerMsg(withId);
      setTimeout(() => {
        setQueueItems((prev) => [withId, ...prev.slice(0, 4)]);
        setProducerMsg(null);
      }, 600);

      // Consumer receives
      setTimeout(() => {
        setQueueItems((prev) => {
          if (prev.length === 0) return prev;
          const consumed = prev[prev.length - 1];
          setConsumerMsg(consumed);
          return prev.slice(0, -1);
        });
        setTimeout(() => setConsumerMsg(null), 800);
      }, 1200);

      idx++;
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  /* Fetch real data on mount (falls back to demo) */
  useEffect(() => {
    notificationsApi
      .getAll()
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setMessages(res.data);
        }
      })
      .catch(() => {
        /* keep demo data */
      });
  }, []);

  const markAsRead = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, read: true } : m))
    );
    notificationsApi.markRead(Number(id.replace(/\D/g, "")) || 0).catch(() => {});
  }, []);

  const markAllRead = useCallback(() => {
    setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
    notificationsApi.markAllRead().catch(() => {});
    toast.success("All messages marked as read");
  }, []);

  const filteredMessages = messages.filter((m) => {
    if (filter === "all") return true;
    if (filter === "unread") return !m.read;
    return m.type === filter;
  });

  const unreadCount = messages.filter((m) => !m.read).length;
  const todayCount = messages.filter(
    (m) => new Date(m.created_at).toDateString() === new Date().toDateString()
  ).length;

  const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
    { value: "all", label: "All Messages" },
    { value: "unread", label: "Unread" },
    { value: "booking_confirmed", label: "Confirmations" },
    { value: "conflict", label: "Conflicts" },
    { value: "resource_freed", label: "Resource Freed" },
    { value: "exam_scheduled", label: "Exam Scheduled" },
    { value: "broadcast", label: "Broadcasts" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications — IPC Message Queue"
        subtitle="Inter-process communication between departments via OS message queue mechanism"
        breadcrumb={["CUIScheduler", "Notifications"]}
        osConcepts={[
          OS_CONCEPTS.IPC_MSGQUEUE,
          OS_CONCEPTS.PROCESS_STATES,
        ]}
      />

      {/* OS Banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-os-bg/40 border border-os-border/30">
        <MessageSquare size={18} className="text-os-text flex-shrink-0" />
        <p className="text-[13px] text-os-text/80 font-mono">
          Departments communicate via message queue — same IPC mechanism used between OS processes.
          Producer enqueues, consumer dequeues. FIFO ordering with priority override.
        </p>
        <OSConceptBadge
          concept="IPC — Message Queue"
          chapter="Ch.3"
          description={OS_CONCEPTS.IPC_MSGQUEUE.description}
          size="sm"
          pulse
        />
      </div>

      {/* Message Queue Visualizer */}
      <GlowCard glowColor="os" className="overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Layers size={16} className="text-os-text" />
            Message Queue Visualizer
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-text-tertiary">
              Queue Depth:{" "}
              <span className="text-os-text font-bold">{queueItems.length}</span>
            </span>
            <LivePulse />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 py-6">
          {/* Producer */}
          <div className="flex flex-col items-center gap-2 min-w-[120px]">
            <div className="px-4 py-3 rounded-lg border border-accent-blue/30 bg-accent-blue-soft text-center">
              <span className="text-[10px] font-mono text-accent-blue/70 uppercase tracking-wider block">
                Producer
              </span>
              <span className="text-[13px] font-semibold text-accent-blue">
                Dept Sender
              </span>
            </div>
            <OSConceptBadge concept="send()" chapter="Ch.3" size="sm" pulse={false} />
          </div>

          {/* Arrow from producer */}
          <div className="flex items-center gap-1 mx-1">
            <AnimatePresence>
              {producerMsg && (
                <motion.div
                  initial={{ opacity: 0, x: -30, scale: 0.5 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 30, scale: 0.5 }}
                  className="w-10 h-8 rounded flex items-center justify-center text-[9px] font-mono font-bold text-white"
                  style={{ backgroundColor: producerMsg.color }}
                >
                  {producerMsg.label}
                </motion.div>
              )}
            </AnimatePresence>
            <ArrowRight size={20} className="text-text-tertiary" />
          </div>

          {/* Queue Buffer */}
          <div className="flex items-center gap-1 px-3 py-2 rounded-lg border-2 border-dashed border-os-border/40 bg-os-bg/20 min-w-[240px] min-h-[52px] justify-center">
            <AnimatePresence mode="popLayout">
              {queueItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.5, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.5, x: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="w-12 h-10 rounded-md flex flex-col items-center justify-center text-white shadow-md"
                  style={{ backgroundColor: item.color }}
                >
                  <span className="text-[8px] font-mono font-bold leading-none">
                    {item.label}
                  </span>
                  <span className="text-[7px] opacity-70 mt-0.5">MSG</span>
                </motion.div>
              ))}
            </AnimatePresence>
            {queueItems.length === 0 && (
              <span className="text-[11px] text-text-tertiary font-mono">
                EMPTY
              </span>
            )}
          </div>

          {/* Arrow to consumer */}
          <div className="flex items-center gap-1 mx-1">
            <ArrowRight size={20} className="text-text-tertiary" />
            <AnimatePresence>
              {consumerMsg && (
                <motion.div
                  initial={{ opacity: 0, x: -30, scale: 0.5 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5, x: 30 }}
                  className="w-10 h-8 rounded flex items-center justify-center text-[9px] font-mono font-bold text-white"
                  style={{ backgroundColor: consumerMsg.color }}
                >
                  {consumerMsg.label}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Consumer */}
          <div className="flex flex-col items-center gap-2 min-w-[120px]">
            <div className="px-4 py-3 rounded-lg border border-accent-teal/30 bg-accent-teal-soft text-center">
              <span className="text-[10px] font-mono text-accent-teal/70 uppercase tracking-wider block">
                Consumer
              </span>
              <span className="text-[13px] font-semibold text-accent-teal">
                Dept Receiver
              </span>
            </div>
            <OSConceptBadge concept="receive()" chapter="Ch.3" size="sm" pulse={false} />
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 pt-2 border-t border-border/30">
          <span className="text-[10px] font-mono text-text-tertiary">
            FIFO Order | Bounded Buffer | Asynchronous IPC
          </span>
        </div>
      </GlowCard>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Unread Messages"
          value={unreadCount}
          subtitle="Messages pending in queue"
          icon={Mail}
          osConcept={{
            concept: "Queue Depth",
            chapter: "Ch.3",
            description: "Number of messages waiting to be consumed from the IPC queue",
          }}
        />
        <StatCard
          label="Queue Depth"
          value={queueItems.length}
          subtitle="Current buffer occupancy"
          icon={Layers}
          osConcept={{
            concept: "Bounded Buffer",
            chapter: "Ch.6",
            description: "Producer-consumer bounded buffer — tracks current queue depth",
          }}
        />
        <StatCard
          label="Messages Today"
          value={todayCount}
          subtitle="IPC transactions today"
          icon={Clock}
          osConcept={{
            concept: "Throughput",
            chapter: "Ch.5",
            description: "Number of IPC messages processed per time period",
          }}
        />
      </div>

      {/* Inbox Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-display font-bold text-text-primary flex items-center gap-2">
            <Inbox size={20} className="text-accent-blue" />
            Inbox
          </h2>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-accent-blue-soft text-accent-blue border border-accent-blue/20">
            {filteredMessages.length} messages
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium rounded-lg border border-border bg-bg-secondary text-text-secondary hover:text-text-primary hover:border-border-light transition-colors"
            >
              <Filter size={14} />
              {FILTER_OPTIONS.find((f) => f.value === filter)?.label || "All"}
              <ChevronDown size={12} />
            </button>
            {filterDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-border bg-bg-secondary shadow-lg z-50">
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setFilter(opt.value);
                      setFilterDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-[12px] hover:bg-bg-hover transition-colors first:rounded-t-lg last:rounded-b-lg",
                      filter === opt.value
                        ? "text-accent-blue bg-accent-blue-soft/30"
                        : "text-text-secondary"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mark All Read */}
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium rounded-lg border border-border bg-bg-secondary text-text-secondary hover:text-text-primary hover:border-border-light transition-colors"
          >
            <CheckCheck size={14} />
            Mark All Read
          </button>

          {/* Compose */}
          <button
            onClick={() => setComposeOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold rounded-lg bg-accent-blue text-white hover:bg-accent-blue/90 transition-colors shadow-blue-glow"
          >
            <Send size={14} />
            Compose
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="space-y-2">
        <AnimatePresence>
          {filteredMessages.map((msg, i) => {
            const typeConfig = MSG_TYPE_CONFIG[msg.type] || MSG_TYPE_CONFIG.broadcast;
            const TypeIcon = typeConfig.icon;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.03 }}
              >
                <div
                  onClick={() => {
                    setSelectedMessage(msg);
                    if (!msg.read) markAsRead(msg.id);
                  }}
                  className={cn(
                    "relative rounded-xl border p-4 cursor-pointer transition-all duration-200",
                    "hover:border-border-light hover:shadow-blue-glow/30",
                    msg.read
                      ? "bg-bg-secondary border-border/50"
                      : "bg-bg-secondary border-accent-blue/30 shadow-sm"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Read indicator */}
                    <div className="mt-1">
                      {msg.read ? (
                        <MailOpen size={18} className="text-text-tertiary" />
                      ) : (
                        <div className="relative">
                          <Mail size={18} className="text-accent-blue" />
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent-blue animate-pulse" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {/* Type badge */}
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider border",
                            typeConfig.bg,
                            typeConfig.color,
                            typeConfig.border
                          )}
                        >
                          <TypeIcon size={10} />
                          {typeConfig.label}
                        </span>

                        {/* Department info */}
                        <span className="text-[11px] font-mono text-text-tertiary">
                          {msg.from_department}
                          <ArrowRight size={10} className="inline mx-1" />
                          {msg.to_department}
                        </span>

                        {/* Time */}
                        <span className="ml-auto text-[11px] text-text-tertiary flex-shrink-0">
                          {formatRelativeTime(msg.created_at)}
                        </span>
                      </div>

                      <h4
                        className={cn(
                          "text-[14px] truncate",
                          msg.read
                            ? "text-text-secondary font-medium"
                            : "text-text-primary font-semibold"
                        )}
                      >
                        {msg.subject}
                      </h4>

                      <p className="text-[12px] text-text-tertiary mt-0.5 truncate">
                        {msg.body}
                      </p>
                    </div>

                    {/* OS concept badge */}
                    <OSConceptBadge
                      concept="IPC"
                      chapter="Ch.3"
                      description={msg.os_concept}
                      size="sm"
                      pulse={false}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredMessages.length === 0 && (
          <div className="text-center py-16">
            <Inbox size={40} className="text-text-tertiary mx-auto mb-3 opacity-50" />
            <p className="text-text-tertiary text-[14px]">No messages match the current filter.</p>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedMessage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-xl border border-border bg-bg-secondary p-6 shadow-lg mx-4"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {(() => {
                    const cfg =
                      MSG_TYPE_CONFIG[selectedMessage.type] || MSG_TYPE_CONFIG.broadcast;
                    const TIcon = cfg.icon;
                    return (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase border",
                          cfg.bg,
                          cfg.color,
                          cfg.border
                        )}
                      >
                        <TIcon size={10} />
                        {cfg.label}
                      </span>
                    );
                  })()}
                  <span className="text-[11px] text-text-tertiary">
                    {formatRelativeTime(selectedMessage.created_at)}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="p-1 rounded-md hover:bg-bg-hover text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <h3 className="text-lg font-display font-bold text-text-primary mb-2">
                {selectedMessage.subject}
              </h3>

              <div className="flex items-center gap-2 text-[12px] text-text-tertiary mb-4">
                <span className="font-mono">
                  From: <span className="text-accent-blue">{selectedMessage.from_department}</span>
                </span>
                <ArrowRight size={12} />
                <span className="font-mono">
                  To: <span className="text-accent-teal">{selectedMessage.to_department}</span>
                </span>
              </div>

              <div className="p-4 rounded-lg bg-bg-tertiary border border-border/50 text-[13px] text-text-secondary leading-relaxed mb-4">
                {selectedMessage.body}
              </div>

              <div className="p-3 rounded-lg bg-os-bg/30 border border-os-border/20">
                <div className="flex items-start gap-2">
                  <OSConceptBadge
                    concept="IPC — Message Queue"
                    chapter="Ch.3"
                    size="sm"
                    pulse={false}
                  />
                  <p className="text-[11px] text-os-text/70 font-mono leading-relaxed">
                    {selectedMessage.os_concept}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compose Modal */}
      <AnimatePresence>
        {composeOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setComposeOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-xl border border-border bg-bg-secondary p-6 shadow-lg mx-4"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-display font-bold text-text-primary flex items-center gap-2">
                  <Send size={18} className="text-accent-blue" />
                  Compose Message
                </h3>
                <button
                  onClick={() => setComposeOpen(false)}
                  className="p-1 rounded-md hover:bg-bg-hover text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                    To Department
                  </label>
                  <select className="w-full px-3 py-2 text-[13px] rounded-lg border border-border bg-bg-tertiary text-text-primary focus:outline-none focus:border-accent-blue/50 transition-colors">
                    <option value="">Select department...</option>
                    <option value="cs">Computer Science</option>
                    <option value="ee">Electrical Engineering</option>
                    <option value="me">Mechanical Engineering</option>
                    <option value="admin">Admin Office</option>
                    <option value="exam">Exam Cell</option>
                    <option value="all">All Departments (Broadcast)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                    Message Type
                  </label>
                  <select className="w-full px-3 py-2 text-[13px] rounded-lg border border-border bg-bg-tertiary text-text-primary focus:outline-none focus:border-accent-blue/50 transition-colors">
                    <option value="booking_confirmed">Booking Confirmed</option>
                    <option value="conflict">Conflict Alert</option>
                    <option value="resource_freed">Resource Freed</option>
                    <option value="exam_scheduled">Exam Scheduled</option>
                    <option value="broadcast">Broadcast</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="Message subject..."
                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-border bg-bg-tertiary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-blue/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                    Body
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Message body..."
                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-border bg-bg-tertiary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-blue/50 transition-colors resize-none"
                  />
                </div>

                <div className="p-3 rounded-lg bg-os-bg/30 border border-os-border/20">
                  <OSConceptBadge
                    concept="IPC send() — Enqueue to Message Queue"
                    chapter="Ch.3"
                    description="Sending a message enqueues it to the destination department's message queue buffer"
                    size="sm"
                    pulse={false}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setComposeOpen(false)}
                    className="px-4 py-2 text-[13px] font-medium rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-border-light transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      toast.success("Message enqueued to IPC queue");
                      setComposeOpen(false);
                    }}
                    className="px-4 py-2 text-[13px] font-semibold rounded-lg bg-accent-blue text-white hover:bg-accent-blue/90 transition-colors shadow-blue-glow"
                  >
                    <span className="flex items-center gap-1.5">
                      <Send size={14} />
                      Send Message
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
