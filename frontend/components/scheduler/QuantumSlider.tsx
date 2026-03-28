"use client";

import * as Slider from "@radix-ui/react-slider";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";
import { OS_CONCEPTS } from "@/constants/osConcepts";
import { cn } from "@/lib/utils";

interface QuantumSliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function QuantumSlider({ value, onChange, className }: QuantumSliderProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-text-primary">
            Time Quantum
          </span>
          <OSConceptBadge
            concept="Time Quantum"
            description={OS_CONCEPTS.ROUND_ROBIN.description}
            chapter={OS_CONCEPTS.ROUND_ROBIN.chapter}
            size="sm"
            pulse={false}
          />
        </div>
        <span className="font-mono text-[14px] font-semibold text-accent-teal bg-accent-teal-soft px-2.5 py-0.5 rounded-md">
          {value} min
        </span>
      </div>

      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={10}
        max={120}
        step={5}
      >
        <Slider.Track className="bg-bg-primary border border-border relative grow rounded-full h-[6px]">
          <Slider.Range className="absolute bg-gradient-to-r from-accent-teal to-accent-blue rounded-full h-full" />
        </Slider.Track>
        <Slider.Thumb
          className={cn(
            "block w-5 h-5 rounded-full",
            "bg-accent-teal border-2 border-bg-primary",
            "shadow-teal-glow",
            "hover:bg-accent-blue transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-accent-teal/50"
          )}
        />
      </Slider.Root>

      <div className="flex justify-between text-[10px] font-mono text-text-tertiary">
        <span>10 min</span>
        <span>60 min</span>
        <span>120 min</span>
      </div>
    </div>
  );
}

export default QuantumSlider;
