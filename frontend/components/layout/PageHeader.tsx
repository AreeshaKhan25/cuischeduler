"use client";

import { cn } from "@/lib/utils";
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";
import { ChevronRight } from "lucide-react";

interface OSConcept {
  name: string;
  chapter: string;
  description: string;
}

interface PageHeaderProps {
  title: string;
  subtitle: string;
  osConcepts: OSConcept[];
  breadcrumb: string[];
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  osConcepts,
  breadcrumb,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-[12px]">
        {breadcrumb.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && (
              <ChevronRight size={12} className="text-text-tertiary" />
            )}
            <span
              className={cn(
                i === breadcrumb.length - 1
                  ? "text-text-primary font-medium"
                  : "text-text-tertiary hover:text-text-secondary cursor-pointer transition-colors"
              )}
            >
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary tracking-tight">
          {title}
        </h1>
        <p className="text-[14px] text-text-secondary mt-1">{subtitle}</p>
      </div>

      {/* OS Concepts Banner */}
      {osConcepts.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-os-bg/30 border border-os-border/20">
          <span className="text-[10px] font-mono text-os-text/60 uppercase tracking-wider self-center mr-1">
            OS Concepts:
          </span>
          {osConcepts.map((concept) => (
            <OSConceptBadge
              key={concept.name}
              concept={concept.name}
              chapter={concept.chapter}
              description={concept.description}
              size="sm"
              pulse={false}
              position="inline"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
