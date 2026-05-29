"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, SectionOutput } from "@/lib/store";
import { DoubleBezel, PillCTA, SeverityBadge, GlassNav } from "@/components/primitives";
import {
  IconChevron,
  IconChevronDown,
  IconCheck,
  IconShield,
  IconDoc,
  IconSparkle,
  IconDownload,
  IconX,
  IconArrow,
  IconHome,
  IconArrowLeft,
  IconArrowRight,
} from "@/components/icons";

const SECTIONS = [
  { key: "executive_summary", n: "01", title: "Executive Summary" },
  { key: "business_objective", n: "02", title: "Business Objective" },
  { key: "scope", n: "03", title: "Scope" },
  { key: "stakeholders", n: "04", title: "Stakeholders" },
  { key: "functional_requirements", n: "05", title: "Functional Requirements" },
  { key: "non_functional_requirements", n: "06", title: "Non-Functional Requirements" },
  { key: "assumptions", n: "07", title: "Assumptions" },
  { key: "constraints", n: "08", title: "Constraints" },
  { key: "acceptance_criteria", n: "09", title: "Acceptance Criteria" },
  { key: "user_access_management", n: "10", title: "User Access Management" },
  { key: "security_controls", n: "11", title: "Security Controls" },
  { key: "benefits_realization", n: "12", title: "Benefits Realization" },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

// Normalize IDs to 2-digit format (FR-1 -> FR-01, FR-001 -> FR-01)
function normalizeId(id: string): string {
  if (!id) return "";
  const match = id.match(/^([A-Za-z]+)-(\d+)$/);
  if (!match) return id;
  const num = parseInt(match[2], 10);
  return `${match[1]}-${String(num).padStart(2, "0")}`;
}

const ID_PREFIXES: Record<string, string> = {
  functional_requirements: "FR",
  non_functional_requirements: "NFR",
  acceptance_criteria: "AC",
  user_access_management: "UAM",
  security_controls: "SC",
  benefits_realization: "BR",
};

function getDisplayId(sectionKey: string, item: any, index: number): string {
  const prefix = ID_PREFIXES[sectionKey];
  if (prefix) {
    return `${prefix}-${String(index + 1).padStart(2, "0")}`;
  }
  const rawId = item?.id || item?.requirement_id;
  if (rawId) return normalizeId(rawId);
  return "";
}

// Sanitize project name for filename
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 50);
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────────────────────────────────
function Sidebar({
  project,
  activeKey,
  onSelect,
  brd,
  visitedSections,
}: {
  project: string;
  activeKey: string;
  onSelect: (key: string) => void;
  brd: Record<string, SectionOutput | undefined>;
  visitedSections: Set<string>;
}) {
  const router = useRouter();
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    const el = itemRefs.current.get(activeKey);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeKey]);

  const handleSelect = (key: string) => {
    onSelect(key);
  };

  return (
    <aside className="w-1/4 min-w-[280px] max-w-[360px] shrink-0 flex flex-col gap-6 py-6 pl-6 pr-2 h-full overflow-hidden">
      {/* Top: back to home + project */}
      <div className="flex flex-col gap-5 shrink-0">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 group w-max"
          title="Back to Home"
        >
          <span className="w-7 h-7 rounded-full bg-white/[0.05] ring-1 ring-white/10 flex items-center justify-center text-secondary group-hover:text-emerald-400 group-hover:ring-emerald-500/30 transition-colors">
            <IconHome size={13} />
          </span>
          <span className="text-[13px] font-medium tracking-tight text-ink group-hover:text-emerald-400 transition-colors">
            Precedent
          </span>
        </button>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.18em] text-tertiary font-medium">
            Project
          </span>
          <span className="text-[14px] font-medium text-ink tracking-tight leading-snug break-words">
            {project}
          </span>
          <span className="text-[11px] font-mono text-tertiary mt-0.5">
            brd-2026-0418
          </span>
        </div>
      </div>

      <div className="border-t hairline shrink-0" />

      {/* Section list */}
      <div className="flex flex-col gap-1.5 flex-1 min-h-0 overflow-y-auto -mr-2 pr-2">
        <div className="text-[10px] uppercase tracking-[0.18em] text-tertiary font-medium px-2 pb-1">
          BRD Sections
        </div>
        {SECTIONS.map((s) => {
          const isActive = s.key === activeKey;
          const sec = brd[s.key];
          const hasUnvisitedFeedback = sec?.feedback?.some(
            (f) => !f.accepted && !f.rejected && !visitedSections.has(s.key)
          );
          const hasAnyFeedback = sec?.feedback?.some(
            (f) => !f.accepted && !f.rejected
          );
          return (
            <button
              key={s.key}
              ref={(el) => {
                if (el) itemRefs.current.set(s.key, el);
              }}
              onClick={() => handleSelect(s.key)}
              className={[
                "group relative flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-colors",
                isActive ? "bg-emerald-500/[0.08]" : "hover:bg-white/[0.02]",
              ].join(" ")}
            >
              <span className="w-4 flex justify-center">
                {isActive ? (
                  <span className="nav-dot" />
                ) : (
                  <span className="text-[10px] font-mono text-tertiary tabular-nums">
                    {s.n}
                  </span>
                )}
              </span>
              <span
                className={`text-[13px] tracking-tight flex-1 leading-tight ${
                  isActive
                    ? "text-emerald-400 font-medium"
                    : "text-body group-hover:text-ink"
                }`}
              >
                {s.title}
              </span>
              {hasAnyFeedback && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    hasUnvisitedFeedback ? "bg-amber-400" : "bg-zinc-600"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Progress + CTA */}
      <div className="flex flex-col gap-3 pt-2 shrink-0">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] uppercase tracking-[0.18em] text-tertiary font-medium">
              Progress
            </span>
            <span className="text-[11px] font-mono text-secondary tabular-nums">
              {visitedSections.size} of {SECTIONS.length} sections reviewed
            </span>
          </div>
          <div className="h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-700"
              style={{
                width: `${(visitedSections.size / SECTIONS.length) * 100}%`,
                boxShadow: "0 0 8px rgba(16,185,129,0.5)",
              }}
            />
          </div>
        </div>

      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Table Renderer for tabulated data
// ─────────────────────────────────────────────────────────────────────────────
function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: Array<{ key: string; cells: React.ReactNode[] }>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b hairline">
            {headers.map((h, i) => (
              <th
                key={i}
                className="pb-3 pr-4 text-[10px] uppercase tracking-[0.18em] text-tertiary font-medium"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-b hairline">
              {row.cells.map((cell, i) => (
                <td key={i} className="py-3.5 pr-4 text-[13.5px] text-body leading-relaxed">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section content renderer
// ─────────────────────────────────────────────────────────────────────────────
function SectionBody({
  sectionKey,
  content,
}: {
  sectionKey: string;
  content: Record<string, any>;
}) {
  if (!content || Object.keys(content).length === 0) {
    return (
      <p className="text-[14px] text-tertiary italic">No content generated.</p>
    );
  }

  // Scope
  if (sectionKey === "scope") {
    return (
      <div className="grid grid-cols-2 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-mono">
              In Scope
            </span>
            <span className="text-[10px] font-mono text-tertiary">
              — {(content.in_scope || []).length}
            </span>
          </div>
          <ul className="flex flex-col gap-3">
            {(content.in_scope || []).map((it: string, i: number) => (
              <li
                key={i}
                className="flex gap-3 text-[14px] text-body leading-relaxed"
              >
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-justify">{it}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] uppercase tracking-[0.2em] text-tertiary font-mono">
              Out of Scope
            </span>
            <span className="text-[10px] font-mono text-tertiary">
              — {(content.out_of_scope || []).length}
            </span>
          </div>
          <ul className="flex flex-col gap-3">
            {(content.out_of_scope || []).map((it: string, i: number) => (
              <li
                key={i}
                className="flex gap-3 text-[14px] text-tertiary leading-relaxed"
              >
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-tertiary/40 shrink-0" />
                <span className="text-justify">{it}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // Stakeholders — TABLE
  if (sectionKey === "stakeholders") {
    const items = content.stakeholders || [];
    return (
      <DataTable
        headers={["Name", "Role / Designation", "RACI"]}
        rows={items.map((p: any, i: number) => ({
          key: i,
          cells: [
            <div key="name" className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/[0.05] ring-1 ring-white/10 flex items-center justify-center text-[11px] font-medium text-ink">
                {p.name
                  .split(" ")
                  .map((x: string) => x[0])
                  .join("")}
              </span>
              <span className="text-[14px] text-ink tracking-tight">
                {p.name}
              </span>
            </div>,
            <span key="role" className="text-secondary text-justify">
              {p.role}
            </span>,
            <span
              key="raci"
              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${
                p.raci === "A"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-white/[0.04] text-secondary"
              }`}
            >
              {p.raci}
            </span>,
          ],
        }))}
      />
    );
  }

  // Functional Requirements
  if (sectionKey === "functional_requirements") {
    const items = content.requirements || [];
    return (
      <DataTable
        headers={["ID", "Requirement", "Priority"]}
        rows={items.map((r: any, i: number) => ({
          key: r.id || i,
          cells: [
            <span key="id" className="font-mono text-[12px] text-emerald-400/80">
              {getDisplayId(sectionKey, r, i)}
            </span>,
            <span key="req" className="text-justify">{r.requirement}</span>,
            <span
              key="pri"
              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider whitespace-nowrap ${
                r.priority === "Must Have"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : r.priority === "Should Have"
                  ? "bg-amber-500/10 text-amber-400"
                  : "bg-zinc-500/10 text-secondary"
              }`}
            >
              {r.priority}
            </span>,
          ],
        }))}
      />
    );
  }

  // Non-Functional Requirements
  if (sectionKey === "non_functional_requirements") {
    const items = content.requirements || [];
    return (
      <DataTable
        headers={["ID", "Category", "Requirement", "Metric"]}
        rows={items.map((r: any, i: number) => ({
          key: i,
          cells: [
            <span key="id" className="font-mono text-[12px] text-emerald-400/80">
              {getDisplayId(sectionKey, r, i)}
            </span>,
            <span key="cat" className="text-emerald-400/80 text-[13px]">
              {r.category}
            </span>,
            <span key="req" className="text-justify">{r.requirement}</span>,
            <span key="met" className="font-mono text-[12px] text-secondary">
              {r.metric}
            </span>,
          ],
        }))}
      />
    );
  }

  // Acceptance Criteria
  if (sectionKey === "acceptance_criteria") {
    const items = content.criteria || [];
    return (
      <DataTable
        headers={["ID", "Criteria"]}
        rows={items.map((c: any, i: number) => ({
          key: i,
          cells: [
            <span key="id" className="font-mono text-[12px] text-emerald-400/80">
              {getDisplayId(sectionKey, c, i)}
            </span>,
            <span key="crit" className="text-justify">{c.criteria}</span>,
          ],
        }))}
      />
    );
  }

  // User Access Management
  if (sectionKey === "user_access_management") {
    const items = content.roles || [];
    return (
      <DataTable
        headers={["ID", "Role", "Permissions", "IAM Group"]}
        rows={items.map((r: any, i: number) => ({
          key: i,
          cells: [
            <span key="id" className="font-mono text-[12px] text-emerald-400/80">
              {getDisplayId(sectionKey, r, i)}
            </span>,
            <span key="role" className="text-emerald-400/80 text-[13px]">
              {r.role}
            </span>,
            <span key="perm" className="text-justify">{r.permissions}</span>,
            <span key="iam" className="font-mono text-[12px] text-secondary">
              {r.iam_group}
            </span>,
          ],
        }))}
      />
    );
  }

  // Security Controls
  if (sectionKey === "security_controls") {
    const items = content.controls || [];
    return (
      <DataTable
        headers={["ID", "Domain", "Control", "Implementation"]}
        rows={items.map((c: any, i: number) => ({
          key: i,
          cells: [
            <span key="id" className="font-mono text-[12px] text-emerald-400/80">
              {getDisplayId(sectionKey, c, i)}
            </span>,
            <span key="dom" className="text-emerald-400/80 text-[13px]">
              {c.domain}
            </span>,
            <span key="ctrl" className="text-justify">{c.control}</span>,
            <span key="impl" className="text-justify">{c.implementation}</span>,
          ],
        }))}
      />
    );
  }

  // Benefits Realization
  if (sectionKey === "benefits_realization") {
    const items = content.benefits || [];
    return (
      <DataTable
        headers={["ID", "Benefit", "Measurement", "Timeline"]}
        rows={items.map((b: any, i: number) => ({
          key: i,
          cells: [
            <span key="id" className="font-mono text-[12px] text-emerald-400/80">
              {getDisplayId(sectionKey, b, i)}
            </span>,
            <span key="ben" className="text-emerald-400/80 text-[13px]">
              {b.benefit}
            </span>,
            <span key="meas" className="text-justify">{b.measurement}</span>,
            <span key="time" className="font-mono text-[12px] text-secondary">
              {b.timeline}
            </span>,
          ],
        }))}
      />
    );
  }

  // Assumptions & Constraints — bullet lists
  if (sectionKey === "assumptions" || sectionKey === "constraints") {
    const items = content.assumptions || content.constraints || [];
    return (
      <ul className="flex flex-col gap-3">
        {items.map((item: string, i: number) => (
          <li key={i} className="flex gap-3 text-[14.5px] text-body leading-relaxed">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-justify">{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  // Default prose (executive_summary, business_objective)
  const body = content.narrative || [];
  const paragraphs = Array.isArray(body) ? body : [body];
  return (
    <div className="flex flex-col gap-4">
      {paragraphs.map((para: string, i: number) => (
        <p
          key={i}
          className="text-[14.5px] text-body leading-[1.7] text-justify"
        >
          {para}
        </p>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Regenerate Menu
// ─────────────────────────────────────────────────────────────────────────────
function RegenerateMenu({
  onRegenerate,
  onEditPrompt,
}: {
  onRegenerate: () => void;
  onEditPrompt: (prompt: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [prompt, setPrompt] = useState("");

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-[11px] text-tertiary hover:text-ink transition-colors font-mono tracking-tight inline-flex items-center gap-1.5"
      >
        <IconSparkle size={11} />
        regenerate
        <IconChevronDown size={10} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute right-0 top-full mt-2 z-50 w-56"
          >
            <DoubleBezel padding="p-2" outerTone="subtle" className="!ring-white/10">
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => {
                    setOpen(false);
                    onRegenerate();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-[13px] text-body hover:bg-white/[0.04] hover:text-ink transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <IconSparkle size={13} />
                    Regenerate from brief
                  </span>
                </button>
                <button
                  onClick={() => {
                    setShowPrompt(true);
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-[13px] text-body hover:bg-white/[0.04] hover:text-ink transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <IconArrow size={13} />
                    Edit with prompt…
                  </span>
                </button>
              </div>
            </DoubleBezel>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPrompt(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <DoubleBezel padding="p-6">
                <h3 className="text-[15px] font-medium text-ink mb-4 tracking-tight">
                  Edit Section
                </h3>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want changed…"
                  rows={4}
                  className="field w-full bg-surface-2 border border-white/10 rounded-xl px-4 py-3 text-[14px] text-ink                   placeholder:text-tertiary leading-relaxed mb-4"
                  autoFocus
                />
                <div className="flex gap-2">
                  <PillCTA
                    fullWidth
                    onClick={() => {
                      onEditPrompt(prompt);
                      setShowPrompt(false);
                      setPrompt("");
                    }}
                    trailingIcon={<IconArrow size={13} />}
                  >
                    Apply
                  </PillCTA>
                  <button
                    onClick={() => setShowPrompt(false)}
                    className="px-4 py-2 rounded-full text-[13px] text-tertiary hover:text-ink transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </DoubleBezel>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Critic feedback card
// ─────────────────────────────────────────────────────────────────────────────
function CriticCard({
  sectionKey,
  issues,
  brief,
  content,
}: {
  sectionKey: string;
  issues: Array<{ severity: string; issue: string; suggestion: string; accepted?: boolean; rejected?: boolean }>;
  brief: any;
  content: Record<string, any>;
}) {
  const { acceptFeedback, rejectFeedback, updateSection } = useAppStore();
  const [applying, setApplying] = useState<string | null>(null);

  const activeIssues = issues.filter((x) => !x.accepted && !x.rejected);
  const highMed = activeIssues.filter((x) => x.severity !== "low");
  const low = activeIssues.filter((x) => x.severity === "low");
  const [showLow, setShowLow] = useState(false);

  const handleAccept = async (issue: any) => {
    const index = issues.findIndex((f) => f === issue);
    if (index === -1) return;
    setApplying(`accept-${index}`);
    try {
      const res = await fetch(`${API_BASE}/api/apply-critique`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section_name: sectionKey,
          brief,
          current_content: content,
          critique_issue: issue.issue,
          critique_suggestion: issue.suggestion,
        }),
      });

      if (!res.ok) throw new Error("Failed to apply critique");

      const data = await res.json();
      const updatedFeedback = issues.map((f, i) =>
        i === index ? { ...f, accepted: true } : f
      ) as Array<{ severity: "low" | "medium" | "high"; issue: string; suggestion: string; accepted?: boolean; rejected?: boolean }>;
      updateSection(sectionKey, {
        content: data.content,
        feedback: updatedFeedback,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to apply changes. Please try again.");
    } finally {
      setApplying(null);
    }
  };

  const handleReject = (issue: any) => {
    const index = issues.findIndex((f) => f === issue);
    if (index === -1) return;
    rejectFeedback(sectionKey, index);
  };

  if (!issues.length || (!highMed.length && !low.length)) {
    return (
      <DoubleBezel padding="p-7" outerTone="subtle">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20 flex items-center justify-center text-emerald-400">
            <IconCheck size={15} />
          </span>
          <div className="flex flex-col">
            <span className="text-[13px] text-ink font-medium tracking-tight">
              Critic review clean
            </span>
            <span className="text-[12px] text-tertiary">
              No active issues in this section.
            </span>
          </div>
        </div>
      </DoubleBezel>
    );
  }

  return (
    <DoubleBezel padding="p-7" outerTone="subtle">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-full bg-white/[0.05] ring-1 ring-white/10 flex items-center justify-center text-emerald-400/90">
            <IconShield size={13} />
          </span>
          <span className="text-[13px] font-medium tracking-tight text-ink">
            Critic Review
          </span>
          <span className="text-[11px] font-mono text-tertiary ml-1">
            agent-02
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-[0.18em] font-mono text-tertiary">
          {activeIssues.length} {activeIssues.length === 1 ? "note" : "notes"}
        </span>
      </div>

      <ul className="flex flex-col">
        {highMed.map((it, idx) => {
          const originalIndex = issues.findIndex((f) => f === it);
          const key = `${it.severity}-${originalIndex}`;
          const isApplying = applying === `accept-${originalIndex}`;
          return (
            <li
              key={key}
              className={`flex gap-4 py-4 ${idx !== 0 ? "border-t hairline" : ""}`}
            >
              <div className="shrink-0 self-start pt-0.5">
                <SeverityBadge level={it.severity as any} />
              </div>
              <div className="flex-1 flex flex-col gap-2.5">
                <p className="text-[13.5px] leading-relaxed text-body text-justify">
                  {it.issue}
                </p>
                {it.suggestion && (
                  <p className="text-[12px] text-tertiary text-justify">{it.suggestion}</p>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAccept(it)}
                    disabled={isApplying}
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] tracking-tight transition-colors bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 hover:bg-emerald-500/20"
                  >
                    {isApplying ? (
                      <span className="block w-3 h-3 rounded-full border border-emerald-400/40 border-t-emerald-400 animate-spin" />
                    ) : (
                      <IconCheck size={11} />
                    )}
                    {isApplying ? "Applying…" : "Accept changes"}
                  </button>
                  <button
                    onClick={() => handleReject(it)}
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] tracking-tight transition-colors bg-white/[0.04] text-secondary ring-1 ring-white/10 hover:text-ink hover:bg-white/[0.08]"
                  >
                    <IconX size={11} />
                    Reject
                  </button>
                </div>
              </div>
            </li>
          );
        })}

        {low.length > 0 && !showLow && (
          <li className="border-t hairline pt-4 mt-1">
            <button
              onClick={() => setShowLow(true)}
              className="text-[12px] text-tertiary hover:text-body inline-flex items-center gap-1.5 transition-colors font-mono tracking-tight"
            >
              <IconChevronDown size={11} />
              Show {low.length} low-severity{" "}
              {low.length === 1 ? "note" : "notes"}
            </button>
          </li>
        )}

        {low.length > 0 &&
          showLow &&
          low.map((it) => {
            const originalIndex = issues.findIndex((f) => f === it);
            const key = `low-${originalIndex}`;
            const isApplying = applying === `accept-${originalIndex}`;
            return (
              <li key={key} className="flex gap-4 py-4 border-t hairline">
                <div className="shrink-0 self-start pt-0.5">
                  <SeverityBadge level="low" />
                </div>
                <div className="flex-1 flex flex-col gap-2.5">
                  <p className="text-[13.5px] leading-relaxed text-secondary text-justify">
                    {it.issue}
                  </p>
                  {it.suggestion && (
                    <p className="text-[12px] text-tertiary text-justify">{it.suggestion}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAccept(it)}
                      disabled={isApplying}
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] tracking-tight transition-colors bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 hover:bg-emerald-500/20"
                    >
                      {isApplying ? (
                        <span className="block w-3 h-3 rounded-full border border-emerald-400/40 border-t-emerald-400 animate-spin" />
                      ) : (
                        <IconCheck size={11} />
                      )}
                      {isApplying ? "Applying…" : "Accept changes"}
                    </button>
                    <button
                      onClick={() => handleReject(it)}
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] tracking-tight transition-colors bg-white/[0.04] text-secondary ring-1 ring-white/10 hover:text-ink hover:bg-white/[0.08]"
                    >
                      <IconX size={11} />
                      Reject
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
      </ul>
    </DoubleBezel>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────
function useExportBRD(projectName?: string) {
  const { brd } = useAppStore();

  return async () => {
    if (!brd) return;
    const res = await fetch(`${API_BASE}/api/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brd }),
    });
    if (!res.ok) throw new Error("Export failed");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    const filename = projectName
      ? `${sanitizeFilename(projectName)}_BRD.docx`
      : "BRD.docx";
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Section Navigator (prev / next)
// ─────────────────────────────────────────────────────────────────────────────
function SectionNav({
  activeKey,
  onSelect,
}: {
  activeKey: string;
  onSelect: (key: string) => void;
}) {
  const router = useRouter();
  const currentIndex = SECTIONS.findIndex((s) => s.key === activeKey);
  const prev = SECTIONS[currentIndex - 1];
  const next = SECTIONS[currentIndex + 1];
  const isLast = currentIndex === SECTIONS.length - 1;

  return (
    <div className="flex items-center justify-between">
      {prev ? (
        <button
          onClick={() => onSelect(prev.key)}
          className="inline-flex items-center gap-2 text-[13px] text-secondary hover:text-ink transition-colors"
        >
          <IconArrowLeft size={14} />
          <span>{prev.title}</span>
        </button>
      ) : (
        <span />
      )}

      {next ? (
        <button
          onClick={() => onSelect(next.key)}
          className="inline-flex items-center gap-2 text-[13px] text-secondary hover:text-ink transition-colors"
        >
          <span>{next.title}</span>
          <IconArrowRight size={14} />
        </button>
      ) : isLast ? (
        <button
          onClick={() => router.push("/export")}
          className="inline-flex items-center gap-2 text-[13px] text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <span>Export</span>
          <IconArrowRight size={14} />
        </button>
      ) : (
        <span />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Review Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function ReviewPage() {
  const router = useRouter();
  const {
    brd,
    brief,
    visitedSections,
    visitSection,
    updateSection,
    hasCritique,
    setHasCritique,
  } = useAppStore();
  const [activeKey, setActiveKey] = useState("executive_summary");
  const [regenerating, setRegenerating] = useState(false);
  const [regenerationKey, setRegenerationKey] = useState(0);
  const [runningCritique, setRunningCritique] = useState(false);

  useEffect(() => {
    if (!brd) {
      router.push("/intake");
    }
  }, [brd, router]);

  // Mark section as visited when active changes
  useEffect(() => {
    if (activeKey) {
      visitSection(activeKey);
    }
  }, [activeKey, visitSection]);

  if (!brd) return null;

  const section = SECTIONS.find((s) => s.key === activeKey);
  const content = (brd as Record<string, SectionOutput | undefined>)[activeKey];
  const issues = content?.feedback || [];

  const activeIssues = issues.filter((f) => !f.accepted && !f.rejected);
  const issueCounts = activeIssues.reduce(
    (acc: Record<string, number>, it) => {
      acc[it.severity] = (acc[it.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const handleRegenerate = async (prompt?: string) => {
    if (!brief) return;
    setRegenerating(true);
    try {
      const res = await fetch(`${API_BASE}/api/regenerate-section`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section_name: activeKey,
          brief,
          prompt: prompt || undefined,
        }),
      });
      if (!res.ok) throw new Error("Regeneration failed");
      const data = await res.json();
      updateSection(activeKey, data);
      setRegenerationKey((k) => k + 1);
    } catch (err) {
      console.error(err);
      alert("Failed to regenerate section.");
    } finally {
      setRegenerating(false);
    }
  };

  const handleRunCritique = async () => {
    if (!brd || !brief) return;
    setRunningCritique(true);
    try {
      const res = await fetch(`${API_BASE}/api/critique`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brd,
          brief,
        }),
      });
      if (!res.ok) throw new Error("Critique failed");
      const data = await res.json();
      if (data.brd) {
        Object.entries(data.brd).forEach(([key, section]: [string, any]) => {
          updateSection(key, section);
        });
        setHasCritique(true);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to run critic review. Please try again.");
    } finally {
      setRunningCritique(false);
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden">
      {/* Top nav — stationary */}
      <header className="shrink-0 z-50">
        <GlassNav active="Review" canReview={true} />
      </header>

      {/* Main area — sidebar + content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          project={brief?.project_objective || "Project"}
          activeKey={activeKey}
          onSelect={setActiveKey}
          brd={brd as Record<string, SectionOutput | undefined>}
          visitedSections={visitedSections}
        />

        {/* Workspace — scrollable */}
        <div className="flex-1 overflow-y-auto py-4 pr-4 pl-0">
          <div
            className="relative bg-surface ring-1 ring-white/[0.04] rounded-card overflow-hidden"
            style={{ margin: "16px 16px 16px 0", minHeight: "calc(100% - 32px)" }}
          >
            <div
              className="absolute inset-0 rounded-card pointer-events-none"
              style={{
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            />

            <div className="relative p-10 pb-32 flex flex-col gap-7">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-[11px] font-mono text-tertiary tracking-tight">
                <span>BRD</span>
                <IconChevron size={10} />
                <span className="truncate max-w-[40ch]">
                  {brief?.project_objective || "Project"}
                </span>
                <IconChevron size={10} />
                <span className="text-body shrink-0">
                  § {section?.n} {section?.title}
                </span>
              </div>

              {/* Header */}
              <div className="flex items-end justify-between gap-6">
                <div className="flex items-center gap-4 flex-wrap">
                  <h1 className="text-3xl tracking-tight text-ink font-medium leading-none">
                    {section?.title}
                  </h1>
                  {activeIssues.length > 0 ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      {(["high", "medium", "low"] as const)
                        .filter((k) => issueCounts[k])
                        .map((severity) => (
                          <SeverityBadge
                            key={severity}
                            level={severity}
                            className="normal-case w-auto"
                          >
                            {severity.charAt(0).toUpperCase() + severity.slice(1)}
                          </SeverityBadge>
                        ))}
                      <span className="text-sm text-secondary">
                        {activeIssues.length} {activeIssues.length === 1 ? "issue" : "issues"} found
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-secondary">No issues</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-tertiary shrink-0">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-soft-pulse" />
                    drafter complete
                  </span>
                  <span className="mx-2 text-tertiary">·</span>
                  <span>updated 2m ago</span>
                </div>
              </div>

              {/* Section navigation — top */}
              <SectionNav activeKey={activeKey} onSelect={setActiveKey} />

              {/* Drafted content card */}
              <DoubleBezel padding="p-10">
                <div className="flex items-center justify-between mb-7">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-white/[0.05] ring-1 ring-white/10 flex items-center justify-center text-secondary">
                      <IconDoc size={13} />
                    </span>
                    <span className="text-[13px] font-medium tracking-tight text-ink">
                      Drafted Content
                    </span>
                    <span className="text-[11px] font-mono text-tertiary ml-1">
                      agent-01
                    </span>
                  </div>
                  {regenerating ? (
                    <span className="text-[11px] text-tertiary font-mono inline-flex items-center gap-1.5">
                      <span className="block w-3 h-3 rounded-full border border-white/40 border-t-white animate-spin" />
                      regenerating…
                    </span>
                  ) : (
                    <RegenerateMenu
                      onRegenerate={() => handleRegenerate()}
                      onEditPrompt={(prompt) => handleRegenerate(prompt)}
                    />
                  )}
                </div>

                <SectionBody
                  sectionKey={activeKey}
                  content={content?.content || {}}
                />
              </DoubleBezel>

              {/* Critic feedback card or run-critique prompt */}
              {!hasCritique ? (
                <DoubleBezel padding="p-10" outerTone="subtle">
                  <div className="flex flex-col items-center text-center gap-5">
                    <span className="w-12 h-12 rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <IconShield size={20} />
                    </span>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[15px] font-medium tracking-tight text-ink">
                        Critic Review Not Run
                      </span>
                      <span className="text-[13px] text-secondary max-w-[45ch] leading-relaxed">
                        Run the critic agent to analyze each section and receive recommendations for improvement.
                      </span>
                    </div>
                    <PillCTA
                      onClick={handleRunCritique}
                      loading={runningCritique}
                      trailingIcon={runningCritique ? null : <IconArrow size={14} />}
                    >
                      {runningCritique ? "Analyzing…" : "Run Critic Review"}
                    </PillCTA>
                  </div>
                </DoubleBezel>
              ) : (
                <CriticCard
                  key={regenerationKey}
                  sectionKey={activeKey}
                  issues={issues}
                  brief={brief}
                  content={content?.content || {}}
                />
              )}

              {/* Section navigation — bottom */}
              <SectionNav activeKey={activeKey} onSelect={setActiveKey} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
