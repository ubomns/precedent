"use client";

import { ReactNode } from "react";

type BadgeSeverity = "high" | "medium" | "low";

interface BadgeProps {
  severity?: BadgeSeverity;
  children?: ReactNode;
  className?: string;
}

const severityMap: Record<BadgeSeverity, string> = {
  high: "bg-[var(--badge-high-bg)] text-[var(--badge-high-text)] border-[var(--badge-high-border)]",
  medium:
    "bg-[var(--badge-medium-bg)] text-[var(--badge-medium-text)] border-[var(--badge-medium-border)]",
  low: "bg-[var(--badge-low-bg)] text-[var(--badge-low-text)] border-[var(--badge-low-border)]",
};

const dotColor: Record<BadgeSeverity, string> = {
  high: "bg-[var(--badge-high-text)]",
  medium: "bg-[var(--badge-medium-text)]",
  low: "bg-[var(--badge-low-text)]",
};

export function Badge({
  severity = "low",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        // min-w + left-align so low / medium / high all occupy the same box; this keeps
        // the issue text that follows the badge aligned on a single left edge across rows.
        "inline-flex items-center justify-start gap-1.5 rounded-full px-3 py-1 border text-caption font-medium uppercase tracking-[0.14em] shrink-0 self-start min-w-[5.5rem] whitespace-nowrap",
        severityMap[severity],
        className,
      ].join(" ")}
    >
      <span className={["w-1.5 h-1.5 rounded-full", dotColor[severity]].join(" ")} />
      {children || severity}
    </span>
  );
}
