"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  IconArrow,
  IconArrowDiag,
  IconPlus,
  IconDownload,
  IconShield,
  IconCheck,
  IconChevron,
  IconChevronDown,
  IconX,
  IconSparkle,
  IconDoc,
  LogoIcon,
} from "./icons";

// ─────────────────────────────────────────────────────────────────────────────
// DoubleBezel — the mandatory shell. Outer aluminum tray + inner glass plate.
// ─────────────────────────────────────────────────────────────────────────────
interface DoubleBezelProps {
  className?: string;
  innerClassName?: string;
  padding?: string;
  innerStyle?: React.CSSProperties;
  style?: React.CSSProperties;
  children: ReactNode;
  outerTone?: "default" | "subtle";
}

export function DoubleBezel({
  className = "",
  innerClassName = "",
  padding = "p-10",
  innerStyle,
  style,
  children,
  outerTone = "default",
}: DoubleBezelProps) {
  const outerBg =
    outerTone === "subtle" ? "bg-white/[0.03]" : "bg-white/[0.05]";
  return (
    <div
      className={`relative ${outerBg} ring-1 ring-white/10 p-1.5 rounded-card shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] ${className}`}
      style={style}
    >
      <div
        className={`bg-surface bezel-inner-shadow rounded-card-inner ${padding} ${innerClassName}`}
        style={innerStyle}
      >
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PillCTA — primary action. Trailing nested icon (mandatory, per spec).
// ─────────────────────────────────────────────────────────────────────────────
interface PillCTAProps {
  children: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  size?: "sm" | "md";
  className?: string;
  loading?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
}

export function PillCTA({
  children,
  trailingIcon = null,
  fullWidth = false,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  loading = false,
  type = "button",
  disabled = false,
}: PillCTAProps) {
  const base =
    "cta group relative inline-flex items-center justify-center font-medium tracking-tight rounded-full select-none";
  const sizing =
    size === "sm"
      ? "pl-4 pr-1.5 py-1.5 text-[13px] gap-3"
      : "pl-6 pr-1.5 py-1.5 text-sm gap-4";
  const palette =
    variant === "primary"
      ? "bg-emerald-600 text-white hover:bg-emerald-500"
      : "bg-white/[0.06] text-ink hover:bg-white/[0.10] ring-1 ring-white/10";
  const iconWell = variant === "primary" ? "bg-white/15" : "bg-white/10";

  const iconSize = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const heightPad = size === "sm" ? "py-1.5" : "py-2";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizing} ${heightPad} ${palette} ${
        fullWidth ? "w-full justify-between" : ""
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""} ${className}`}
    >
      <span className="pl-0.5">{children}</span>
      <span
        className={`cta-icon ${iconSize} rounded-full ${iconWell} flex items-center justify-center`}
      >
        {loading ? (
          <span className="block w-3 h-3 rounded-full border border-white/40 border-t-white animate-spin" />
        ) : (
          trailingIcon || <IconArrowDiag size={14} />
        )}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FieldLabel — small caps label that sits above the field.
// ─────────────────────────────────────────────────────────────────────────────
interface FieldLabelProps {
  children: ReactNode;
  hint?: string;
  htmlFor?: string;
}

export function FieldLabel({ children, hint, htmlFor }: FieldLabelProps) {
  return (
    <div className="flex items-baseline justify-between mb-2">
      <label
        htmlFor={htmlFor}
        className="text-xs uppercase tracking-[0.1em] text-secondary font-medium"
      >
        {children}
      </label>
      {hint ? (
        <span className="text-[10px] text-tertiary font-mono">{hint}</span>
      ) : null}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TextField — single-line input
// ─────────────────────────────────────────────────────────────────────────────
interface TextFieldProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  leadingIcon?: ReactNode;
  className?: string;
  required?: boolean;
}

export function TextField({
  id,
  value,
  onChange,
  placeholder,
  leadingIcon,
  className = "",
  required = false,
}: TextFieldProps) {
  return (
    <div className={`relative ${className}`}>
      {leadingIcon ? (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary">
          {leadingIcon}
        </span>
      ) : null}
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      className={`field w-full bg-surface-2 border border-white/10 rounded-xl ${
        leadingIcon ? "pl-11" : "pl-4"
      } pr-4 py-3 text-[14px] text-ink placeholder:text-tertiary`}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TextArea — multi-line input
// ─────────────────────────────────────────────────────────────────────────────
interface TextAreaProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  required?: boolean;
}

export function TextArea({
  id,
  value,
  onChange,
  placeholder,
  rows = 4,
  className = "",
  required = false,
}: TextAreaProps) {
  return (
    <textarea
      id={id}
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className={`field w-full bg-surface-2 border border-white/10 rounded-xl px-4 py-3 text-[14px] text-ink placeholder:text-tertiary leading-relaxed ${className}`}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SeverityBadge — pill-shaped, all-cap.
// ─────────────────────────────────────────────────────────────────────────────
interface SeverityBadgeProps {
  level?: "high" | "medium" | "low";
  className?: string;
  children?: ReactNode;
}

export function SeverityBadge({
  level = "low",
  className = "",
  children,
}: SeverityBadgeProps) {
  const map = {
    high: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    low: "bg-zinc-500/10 text-secondary border-zinc-500/20",
  };
  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-0.5 border text-[10px] font-medium uppercase tracking-[0.14em] shrink-0 self-start w-[72px] ${map[level]} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          level === "high"
            ? "bg-rose-400"
            : level === "medium"
            ? "bg-amber-400"
            : "bg-zinc-400"
        }`}
      />
      {children || level}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Eyebrow — small caps tag.
// ─────────────────────────────────────────────────────────────────────────────
interface EyebrowProps {
  children: ReactNode;
  className?: string;
}

export function Eyebrow({ children, className = "" }: EyebrowProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-tertiary ring-1 ring-white/10 bg-white/[0.025] ${className}`}
    >
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GlassNav — floating pill navbar
// ─────────────────────────────────────────────────────────────────────────────
interface GlassNavProps {
  active?: string;
  onNavigate?: (page: string) => void;
  canReview?: boolean;
}

export function GlassNav({
  active = "Intake",
  onNavigate,
  canReview = false,
}: GlassNavProps) {
  const router = useRouter();
  const items = ["Intake", "Review", "Export"];

  const handleNav = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
      return;
    }
    const map: Record<string, string> = {
      Intake: "/intake",
      Review: "/review",
      Export: "/export",
    };
    router.push(map[page] || "/");
  };

  return (
    <nav
      className="mt-3 mb-3 mx-auto w-max rounded-full backdrop-blur-2xl px-2 py-1.5 flex items-center gap-1"
      style={{
        background: "var(--bezel-bg)",
        border: "1px solid var(--bezel-ring)",
        boxShadow: "0 20px 40px -15px var(--shadow-color)",
      }}
    >
      <div
        className="flex items-center gap-2.5 pl-3 pr-4 py-1.5 mr-1"
        style={{ borderRight: "1px solid var(--bezel-ring)" }}
      >
        <LogoIcon size={22} />
        <span className="text-[13px] font-medium tracking-tight text-ink">
          Precedent
        </span>
      </div>
      {items.map((it) => {
        const isActive = it === active;
        const isReview = it === "Review";
        const disabled = isReview && !canReview;
        return (
          <button
            key={it}
            onClick={() => !disabled && handleNav(it)}
            disabled={disabled}
            className={[
              "px-3.5 py-1.5 rounded-full text-[13px] tracking-tight transition-colors",
              isActive ? "bg-white/[0.08] text-ink" : "text-secondary hover:text-ink",
              disabled
                ? "opacity-40 cursor-not-allowed hover:text-secondary"
                : "",
            ].join(" ")}
          >
            {it}
          </button>
        );
      })}
    </nav>
  );
}
