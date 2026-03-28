"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";

interface SafeSequenceDisplayProps {
  sequence: string[];
  isSafe: boolean;
  className?: string;
}

export function SafeSequenceDisplay({ sequence, isSafe, className }: SafeSequenceDisplayProps) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (sequence.length === 0) {
      setVisibleCount(0);
      return;
    }

    setVisibleCount(0);
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setVisibleCount(current);
      if (current >= sequence.length + 1) {
        clearInterval(interval);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [sequence]);

  if (sequence.length === 0 && !isSafe) {
    return (
      <div className={cn("flex items-center gap-3 px-4 py-3 rounded-lg bg-danger/5 border border-danger/20", className)}>
        <XCircle size={20} className="text-danger flex-shrink-0" />
        <div>
          <p className="text-[13px] font-mono font-semibold text-danger">No Safe Sequence</p>
          <p className="text-[11px] text-text-tertiary mt-0.5">System is in an unsafe state - deadlock is possible</p>
        </div>
      </div>
    );
  }

  if (sequence.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-mono font-semibold text-text-tertiary uppercase tracking-wider">
          Safe Sequence
        </span>
        <div className="flex-1 h-px bg-border/50" />
      </div>

      <div className="flex items-center gap-1 flex-wrap">
        <AnimatePresence mode="popLayout">
          {sequence.map((proc, i) => (
            <motion.div key={`${proc}-${i}`} className="flex items-center gap-1">
              {i > 0 && i <= visibleCount && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <ArrowRight size={14} className="text-text-tertiary mx-0.5" />
                </motion.div>
              )}
              {i < visibleCount && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 25,
                  }}
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full border-2",
                    "font-mono text-[14px] font-bold",
                    "bg-gradient-to-b from-[#4f8ef7] to-[#2563eb]",
                    "border-accent-blue text-white",
                    "shadow-blue-glow"
                  )}
                >
                  {proc}
                </motion.div>
              )}
            </motion.div>
          ))}

          {/* Final check/X mark */}
          {visibleCount > sequence.length && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="ml-2"
            >
              {isSafe ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/15 border border-success/40">
                  <CheckCircle2 size={18} className="text-success" />
                  <span className="text-[12px] font-mono font-bold text-success">SAFE</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-danger/15 border border-danger/40">
                  <XCircle size={18} className="text-danger" />
                  <span className="text-[12px] font-mono font-bold text-danger">UNSAFE</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default SafeSequenceDisplay;
