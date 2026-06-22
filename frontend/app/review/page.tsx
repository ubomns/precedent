"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

import { useAppStore, type SectionOutput, type BRD } from "@/lib/store";
import { apiUrl, apiHeaders } from "@/lib/api";
import {
  Button,
  Card,
  Eyebrow,
  Heading1,
  Heading2,
  Body,
  BodySmall,
  Caption,
  Mono,
  Badge,
} from "@/components/design-system";
import { Nav } from "@/components/design-system/nav";
import {
  IconArrow,
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconChevronDown,
  IconDoc,
  IconDownload,
  IconShield,
  IconSparkle,
  IconX,
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
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

const ID_PREFIXES: Record<string, string> = {
  functional_requirements: "FR",
  non_functional_requirements: "NFR",
  acceptance_criteria: "AC",
  user_access_management: "UAM",
  security_controls: "SC",
  benefits_realization: "BR",
};

function normalizeId(id: string): string {
  if (!id) return "";
  const match = id.match(/^([A-Za-z]+)-(\d+)$/);
  if (!match) return id;
  const num = parseInt(match[2], 10);
  return `${match[1]}-${String(num).padStart(2, "0")}`;
}

function getDisplayId(sectionKey: string, item: any, index: number): string {
  const prefix = ID_PREFIXES[sectionKey];
  if (prefix) {
    return `${prefix}-${String(index + 1).padStart(2, "0")}`;
  }
  const rawId = item?.id || item?.requirement_id;
  if (rawId) return normalizeId(rawId);
  return "";
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 50);
}

function countWords(brd: BRD): number {
  try {
    return JSON.stringify(brd)
      .split(/\s+/)
      .filter(Boolean).length;
  } catch {
    return 0;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Data table for structured sections
// ─────────────────────────────────────────────────────────────────────────────
function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: Array<{ key: string | number; cells: React.ReactNode[] }>;
}) {
  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border">
            {headers.map((h, i) => (
              <th
                key={i}
                className="pb-3 pr-4 text-caption uppercase tracking-[0.14em] text-tertiary font-medium"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-b border-border">
              {row.cells.map((cell, i) => (
                <td key={i} className="py-3.5 pr-4 text-body leading-relaxed">
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
// Section body renderer
// ─────────────────────────────────────────────────────────────────────────────
function SectionBody({
  sectionKey,
  content,
}: {
  sectionKey: SectionKey;
  content: Record<string, any>;
}) {
  if (!content || Object.keys(content).length === 0) {
    return (
      <p className="text-body text-tertiary italic">No content generated.</p>
    );
  }

  if (sectionKey === "scope") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Caption className="uppercase tracking-[0.14em] text-accent">
              In Scope
            </Caption>
            <Caption className="text-tertiary">— {(content.in_scope || []).length}</Caption>
          </div>
          <ul className="flex flex-col gap-3">
            {(content.in_scope || []).map((it: string, i: number) => (
              <li key={i} className="flex gap-3 text-body leading-relaxed">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Caption className="uppercase tracking-[0.14em] text-tertiary">
              Out of Scope
            </Caption>
            <Caption className="text-tertiary">— {(content.out_of_scope || []).length}</Caption>
          </div>
          <ul className="flex flex-col gap-3">
            {(content.out_of_scope || []).map((it: string, i: number) => (
              <li key={i} className="flex gap-3 text-body leading-relaxed text-secondary">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-tertiary/40 shrink-0" />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (sectionKey === "stakeholders") {
    const items = content.stakeholders || [];
    return (
      <DataTable
        headers={["Name", "Role / Designation", "RACI"]}
        rows={items.map((p: any, i: number) => ({
          key: i,
          cells: [
            <div key="name" className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-surface-2 ring-1 ring-border-strong flex items-center justify-center text-caption font-medium text-ink">
                {p.name
                  .split(" ")
                  .map((x: string) => x[0])
                  .join("")}
              </span>
              <span className="text-body text-ink tracking-tight">{p.name}</span>
            </div>,
            <span key="role" className="text-secondary">
              {p.role}
            </span>,
            <span
              key="raci"
              className={`inline-flex rounded-full px-2 py-0.5 text-caption font-mono uppercase tracking-wider ${
                p.raci === "A"
                  ? "bg-accent/10 text-accent"
                  : "bg-surface-2 text-secondary"
              }`}
            >
              {p.raci}
            </span>,
          ],
        }))}
      />
    );
  }

  if (sectionKey === "functional_requirements") {
    const items = content.requirements || [];
    return (
      <DataTable
        headers={["ID", "Requirement", "Priority"]}
        rows={items.map((r: any, i: number) => ({
          key: r.id || i,
          cells: [
            <Mono key="id" className="text-accent">
              {getDisplayId(sectionKey, r, i)}
            </Mono>,
            <span key="req">{r.requirement}</span>,
            <span
              key="pri"
              className={`inline-flex rounded-full px-2 py-0.5 text-caption uppercase tracking-wider whitespace-nowrap ${
                r.priority === "Must Have"
                  ? "bg-accent/10 text-accent"
                  : r.priority === "Should Have"
                  ? "bg-[var(--badge-medium-bg)] text-[var(--badge-medium-text)]"
                  : "bg-surface-2 text-secondary"
              }`}
            >
              {r.priority}
            </span>,
          ],
        }))}
      />
    );
  }

  if (sectionKey === "non_functional_requirements") {
    const items = content.requirements || [];
    return (
      <DataTable
        headers={["ID", "Category", "Requirement", "Metric"]}
        rows={items.map((r: any, i: number) => ({
          key: i,
          cells: [
            <Mono key="id" className="text-accent">
              {getDisplayId(sectionKey, r, i)}
            </Mono>,
            <span key="cat" className="text-accent text-body">
              {r.category}
            </span>,
            <span key="req">{r.requirement}</span>,
            <Mono key="met" className="text-secondary">
              {r.metric}
            </Mono>,
          ],
        }))}
      />
    );
  }

  if (sectionKey === "acceptance_criteria") {
    const items = content.criteria || [];
    return (
      <DataTable
        headers={["ID", "Criteria"]}
        rows={items.map((c: any, i: number) => ({
          key: i,
          cells: [
            <Mono key="id" className="text-accent">
              {getDisplayId(sectionKey, c, i)}
            </Mono>,
            <span key="crit">{c.criteria}</span>,
          ],
        }))}
      />
    );
  }

  if (sectionKey === "user_access_management") {
    const items = content.roles || [];
    return (
      <DataTable
        headers={["ID", "Role", "Permissions", "IAM Group"]}
        rows={items.map((r: any, i: number) => ({
          key: i,
          cells: [
            <Mono key="id" className="text-accent">
              {getDisplayId(sectionKey, r, i)}
            </Mono>,
            <span key="role" className="text-accent text-body">
              {r.role}
            </span>,
            <span key="perm">{r.permissions}</span>,
            <Mono key="iam" className="text-secondary">
              {r.iam_group}
            </Mono>,
          ],
        }))}
      />
    );
  }

  if (sectionKey === "security_controls") {
    const items = content.controls || [];
    return (
      <DataTable
        headers={["ID", "Domain", "Control", "Implementation"]}
        rows={items.map((c: any, i: number) => ({
          key: i,
          cells: [
            <Mono key="id" className="text-accent">
              {getDisplayId(sectionKey, c, i)}
            </Mono>,
            <span key="dom" className="text-accent text-body">
              {c.domain}
            </span>,
            <span key="ctrl">{c.control}</span>,
            <span key="impl" className="text-secondary">
              {c.implementation}
            </span>,
          ],
        }))}
      />
    );
  }

  if (sectionKey === "benefits_realization") {
    const items = content.benefits || [];
    return (
      <DataTable
        headers={["ID", "Benefit", "Measurement", "Timeline"]}
        rows={items.map((b: any, i: number) => ({
          key: i,
          cells: [
            <Mono key="id" className="text-accent">
              {getDisplayId(sectionKey, b, i)}
            </Mono>,
            <span key="ben" className="text-accent text-body">
              {b.benefit}
            </span>,
            <span key="meas">{b.measurement}</span>,
            <Mono key="time" className="text-secondary">
              {b.timeline}
            </Mono>,
          ],
        }))}
      />
    );
  }

  if (sectionKey === "assumptions" || sectionKey === "constraints") {
    const items = content.assumptions || content.constraints || [];
    return (
      <ul className="flex flex-col gap-3">
        {items.map((item: string, i: number) => (
          <li key={i} className="flex gap-3 text-body leading-relaxed">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  const body = content.narrative || [];
  const paragraphs = Array.isArray(body) ? body : [body];
  return (
    <div className="flex flex-col gap-4">
      {paragraphs.map((para: string, i: number) => (
        <Body key={i} className="leading-relaxed">
          {para}
        </Body>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Regenerate controls
// ─────────────────────────────────────────────────────────────────────────────
function RegenerateControls({
  onRegenerate,
  loading,
}: {
  onRegenerate: (prompt?: string) => void;
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className="inline-flex items-center gap-1.5 text-caption font-mono tracking-tight text-tertiary hover:text-ink transition-colors disabled:opacity-40"
      >
        <IconSparkle size={12} />
        {loading ? "Regenerating…" : "Regenerate"}
        <IconChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-30 w-56 surface-card bg-surface-2 p-1.5">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onRegenerate();
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-body hover:bg-surface transition-colors flex items-center gap-2"
          >
            <IconSparkle size={14} />
            Regenerate from brief
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setPromptOpen(true);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-body hover:bg-surface transition-colors flex items-center gap-2"
          >
            <IconArrow size={14} />
            Edit with prompt…
          </button>
        </div>
      )}

      {promptOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setPromptOpen(false)}
        >
          <Card
            padding="md"
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <Heading2 className="mb-4">Edit Section</Heading2>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want changed…"
              rows={4}
              className="w-full bg-surface-2 border border-border-strong rounded-xl px-4 py-3 text-body text-ink placeholder:text-tertiary leading-relaxed mb-4 focus:outline-none focus:border-accent-dim focus:ring-[3px] focus:ring-accent/15"
              autoFocus
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                fullWidth
                onClick={() => {
                  onRegenerate(prompt);
                  setPromptOpen(false);
                  setPrompt("");
                }}
              >
                Apply
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setPromptOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
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
  sectionKey: SectionKey;
  issues: Array<{
    severity: "low" | "medium" | "high";
    issue: string;
    suggestion: string;
    accepted?: boolean;
    rejected?: boolean;
  }>;
  brief: any;
  content: Record<string, any>;
}) {
  const { acceptFeedback, rejectFeedback, updateSection } = useAppStore();
  const [applying, setApplying] = useState<string | null>(null);
  const [showLow, setShowLow] = useState(false);

  const activeIssues = issues.filter((x) => !x.accepted && !x.rejected);
  const highMed = activeIssues.filter((x) => x.severity !== "low");
  const low = activeIssues.filter((x) => x.severity === "low");

  const handleAccept = async (issue: any, index: number) => {
    setApplying(`accept-${index}`);
    try {
      const res = await fetch(apiUrl("/api/apply-critique"), {
        method: "POST",
        headers: await apiHeaders(),
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
      );
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

  const handleReject = (index: number) => {
    rejectFeedback(sectionKey, index);
  };

  if (!issues.length || (!highMed.length && !low.length)) {
    return (
      <Card padding="md" tone="elevated">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-accent/10 ring-1 ring-accent/20 flex items-center justify-center text-accent">
            <IconCheck size={18} />
          </span>
          <div className="flex flex-col">
            <Body className="text-ink font-medium">Critic review clean</Body>
            <BodySmall className="text-tertiary">No active issues in this section.</BodySmall>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="md" tone="elevated">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full bg-surface-2 ring-1 ring-border-strong flex items-center justify-center text-accent">
            <IconShield size={14} />
          </span>
          <Body className="font-medium text-ink">Critic Review</Body>
          <Caption className="text-tertiary font-mono">agent-02</Caption>
        </div>
        <Caption className="uppercase tracking-[0.14em] text-tertiary font-mono">
          {activeIssues.length} {activeIssues.length === 1 ? "note" : "notes"}
        </Caption>
      </div>

      <ul className="flex flex-col">
        {highMed.map((it, idx) => (
          <CriticIssueRow
            key={idx}
            issue={it}
            index={issues.findIndex((f) => f === it)}
            applying={applying}
            onAccept={handleAccept}
            onReject={handleReject}
            first={idx === 0}
          />
        ))}

        {low.length > 0 && !showLow && (
          <li className="border-t border-border pt-4 mt-1">
            <button
              type="button"
              onClick={() => setShowLow(true)}
              className="text-body-sm text-tertiary hover:text-body inline-flex items-center gap-1.5 transition-colors font-mono tracking-tight"
            >
              <IconChevronDown size={12} />
              Show {low.length} low-severity {low.length === 1 ? "note" : "notes"}
            </button>
          </li>
        )}

        {showLow &&
          low.map((it) => (
            <CriticIssueRow
              key={`low-${issues.findIndex((f) => f === it)}`}
              issue={it}
              index={issues.findIndex((f) => f === it)}
              applying={applying}
              onAccept={handleAccept}
              onReject={handleReject}
              first={false}
            />
          ))}
      </ul>
    </Card>
  );
}

function CriticIssueRow({
  issue,
  index,
  applying,
  onAccept,
  onReject,
  first,
}: {
  issue: { severity: "low" | "medium" | "high"; issue: string; suggestion: string };
  index: number;
  applying: string | null;
  onAccept: (issue: any, index: number) => void;
  onReject: (index: number) => void;
  first: boolean;
}) {
  const isApplying = applying === `accept-${index}`;
  return (
    <li className={`flex gap-4 py-4 ${!first ? "border-t border-border" : ""}`}>
      <div className="shrink-0 self-start pt-0.5">
        <Badge severity={issue.severity} />
      </div>
      <div className="flex-1 flex flex-col gap-2.5">
        <Body className="leading-relaxed">{issue.issue}</Body>
        {issue.suggestion && (
          <BodySmall className="text-tertiary">{issue.suggestion}</BodySmall>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAccept(issue, index)}
            disabled={isApplying}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-caption tracking-tight transition-colors bg-accent/10 text-accent ring-1 ring-accent/20 hover:bg-accent/20 disabled:opacity-40"
          >
            {isApplying ? (
              <span className="block w-3 h-3 rounded-full border border-accent/40 border-t-accent animate-spin" />
            ) : (
              <IconCheck size={11} />
            )}
            {isApplying ? "Applying…" : "Accept changes"}
          </button>
          <button
            type="button"
            onClick={() => onReject(index)}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-caption tracking-tight transition-colors bg-surface-2 text-secondary ring-1 ring-border-strong hover:text-ink hover:bg-overlay-strong"
          >
            <IconX size={11} />
            Reject
          </button>
        </div>
      </div>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Export action
// ─────────────────────────────────────────────────────────────────────────────
function useExportBRD(projectName?: string) {
  const { brd } = useAppStore();
  const [exporting, setExporting] = useState(false);

  const exportBRD = useCallback(async () => {
    if (!brd) return;
    setExporting(true);
    try {
      const res = await fetch(apiUrl("/api/export"), {
        method: "POST",
        headers: await apiHeaders(),
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
    } catch (err) {
      console.error(err);
      alert("Failed to export BRD. Please try again.");
    } finally {
      setExporting(false);
    }
  }, [brd, projectName]);

  return { exportBRD, exporting };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main review page
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
  const [activeKey, setActiveKey] = useState<SectionKey>("executive_summary");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [runningCritique, setRunningCritique] = useState(false);

  const { exportBRD, exporting } = useExportBRD(brief?.project_objective);

  useEffect(() => {
    if (!brd) {
      router.push("/intake");
    }
  }, [brd, router]);

  useEffect(() => {
    if (activeKey) visitSection(activeKey);
  }, [activeKey, visitSection]);

  const handleSelect = useCallback(
    (key: SectionKey) => {
      if (key === activeKey) return;
      setActiveKey(key);
      setSidebarOpen(false);
    },
    [activeKey]
  );

  const handleRegenerate = async (prompt?: string) => {
    if (!brief) return;
    setRegenerating(true);
    try {
      const res = await fetch(apiUrl("/api/regenerate-section"), {
        method: "POST",
        headers: await apiHeaders(),
        body: JSON.stringify({
          section_name: activeKey,
          brief,
          prompt: prompt || undefined,
        }),
      });
      if (!res.ok) throw new Error("Regeneration failed");
      const data = await res.json();
      updateSection(activeKey, data);
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
      const res = await fetch(apiUrl("/api/critique"), {
        method: "POST",
        headers: await apiHeaders(),
        body: JSON.stringify({ brd, brief }),
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

  if (!brd) return null;

  const section = SECTIONS.find((s) => s.key === activeKey)!;
  const content = (brd as Record<SectionKey, SectionOutput | undefined>)[activeKey];
  const issues = content?.feedback || [];
  const activeIssues = issues.filter((f) => !f.accepted && !f.rejected);
  const issueCounts = activeIssues.reduce(
    (acc: Record<string, number>, it) => {
      acc[it.severity] = (acc[it.severity] || 0) + 1;
      return acc;
    },
    {}
  );

  const currentIndex = SECTIONS.findIndex((s) => s.key === activeKey);
  const prev = SECTIONS[currentIndex - 1];
  const next = SECTIONS[currentIndex + 1];

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Intake", href: "/intake" },
    { label: "Review", href: "/review" },
    { label: "Export", href: "/export" },
  ];

  const navActions = (
    <Button
      size="sm"
      variant="primary"
      onClick={exportBRD}
      loading={exporting}
      trailingIcon={<IconDownload size={14} />}
    >
      Export
    </Button>
  );

  return (
    <div className="min-h-[100dvh] flex flex-col bg-ground">
      <Nav items={navItems} actions={navActions} />

      <main className="flex-1 flex flex-col md:flex-row pt-20 md:pt-24 pb-6 md:pb-8 px-4 md:px-6 gap-4 md:gap-6 max-w-[1400px] mx-auto w-full">
        {/* Mobile section selector */}
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="w-full flex items-center justify-between surface-card px-4 py-3 text-left"
          >
            <span className="flex items-center gap-3">
              <Mono className="text-tertiary">{section.n}</Mono>
              <Body className="text-ink font-medium">{section.title}</Body>
            </span>
            <IconChevronDown size={16} className="text-secondary" />
          </button>
        </div>

        {/* Sidebar */}
        <aside
          className={[
            "fixed inset-y-0 left-0 z-40 w-[280px] bg-ground/95 backdrop-blur-xl border-r border-border transform transition-transform duration-300 md:translate-x-0 md:static md:w-[260px] md:bg-surface md:backdrop-blur-none md:border md:rounded-2xl md:flex-shrink-0 md:h-[calc(100dvh-7rem)] md:sticky md:top-24",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
          role="navigation"
          aria-label="BRD sections"
        >
          <div className="flex flex-col h-full p-4 md:p-5">
            <div className="flex items-center justify-between mb-6 md:hidden">
              <Caption className="uppercase tracking-[0.14em] text-tertiary font-mono">
                BRD Sections
              </Caption>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-overlay-strong"
                aria-label="Close section menu"
              >
                <IconX size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-1 flex-1 overflow-y-auto -mx-1 px-1">
              <Caption className="uppercase tracking-[0.14em] text-tertiary font-mono px-2 mb-1 hidden md:block">
                BRD Sections
              </Caption>
              {SECTIONS.map((s) => {
                const isActive = s.key === activeKey;
                const sec = brd[s.key];
                const hasFeedback = sec?.feedback?.some(
                  (f) => !f.accepted && !f.rejected
                );
                const hasUnvisited = sec?.feedback?.some(
                  (f) => !f.accepted && !f.rejected && !visitedSections.has(s.key)
                );
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => handleSelect(s.key)}
                    className={[
                      "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors",
                      isActive
                        ? "bg-accent/10 text-ink"
                        : "hover:bg-overlay text-secondary hover:text-ink",
                    ].join(" ")}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-accent" />
                    )}
                    <Mono
                      className={[
                        "text-caption w-5",
                        isActive ? "text-accent" : "text-tertiary",
                      ].join(" ")}
                    >
                      {s.n}
                    </Mono>
                    <BodySmall
                      className={[
                        "flex-1 tracking-tight",
                        isActive ? "text-ink font-medium" : "",
                      ].join(" ")}
                    >
                      {s.title}
                    </BodySmall>
                    {hasFeedback && (
                      <span
                        className={[
                          "w-1.5 h-1.5 rounded-full shrink-0",
                          hasUnvisited ? "bg-[var(--badge-medium-text)]" : "bg-tertiary",
                        ].join(" ")}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-border flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between">
                  <Caption className="uppercase tracking-[0.14em] text-tertiary font-mono">
                    Progress
                  </Caption>
                  <Caption className="text-tertiary font-mono">
                    {visitedSections.size} / {SECTIONS.length}
                  </Caption>
                </div>
                <div className="h-1 rounded-full bg-surface-2 overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-500"
                    style={{
                      width: `${(visitedSections.size / SECTIONS.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => router.push("/export")}
                trailingIcon={<IconArrow size={14} />}
              >
                Export
              </Button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <Card
            padding="md"
            className="min-h-[calc(100dvh-6rem)] md:min-h-[calc(100dvh-7rem)]"
          >
            <div className="flex flex-col gap-6 md:gap-8">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-caption font-mono text-tertiary tracking-tight">
                <span>BRD</span>
                <IconChevronDown size={10} className="-rotate-90" />
                <span className="truncate max-w-[30ch]">
                  {brief?.project_objective || "Project"}
                </span>
                <IconChevronDown size={10} className="-rotate-90" />
                <span className="text-body shrink-0">
                  § {section.n} {section.title}
                </span>
              </div>

              {/* Header */}
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                  <Heading1>{section.title}</Heading1>
                  <div className="flex items-center gap-2 flex-wrap">
                    {(["high", "medium", "low"] as const)
                      .filter((k) => issueCounts[k])
                      .map((severity) => (
                        <Badge key={severity} severity={severity}>
                          {severity}
                        </Badge>
                      ))}
                    {activeIssues.length === 0 && (
                      <BodySmall className="text-secondary">No issues</BodySmall>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-caption font-mono text-tertiary shrink-0">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    drafter complete
                  </span>
                  <span>·</span>
                  <span>{countWords(brd)} words</span>
                </div>
              </div>

              {/* Drafted content */}
              <Card padding="md" tone="elevated">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-full bg-surface-2 ring-1 ring-border-strong flex items-center justify-center text-secondary">
                      <IconDoc size={14} />
                    </span>
                    <Body className="font-medium text-ink">Drafted Content</Body>
                    <Caption className="text-tertiary font-mono">agent-01</Caption>
                  </div>
                  <RegenerateControls onRegenerate={handleRegenerate} loading={regenerating} />
                </div>
                <SectionBody sectionKey={activeKey} content={content?.content || {}} />
              </Card>

              {/* Critic section */}
              {issues.length > 0 ? (
                <CriticCard
                  sectionKey={activeKey}
                  issues={issues}
                  brief={brief}
                  content={content?.content || {}}
                />
              ) : !hasCritique ? (
                <Card padding="md" tone="elevated">
                  <div className="flex flex-col items-center text-center gap-5">
                    <span className="w-12 h-12 rounded-full bg-accent/10 ring-1 ring-accent/20 flex items-center justify-center text-accent">
                      <IconShield size={20} />
                    </span>
                    <div className="flex flex-col gap-1.5">
                      <Heading2 className="text-h3">Critic Review Not Run</Heading2>
                      <BodySmall className="text-secondary max-w-[45ch] leading-relaxed">
                        Run the critic agent to analyze each section and receive
                        recommendations for improvement.
                      </BodySmall>
                    </div>
                    <Button
                      onClick={handleRunCritique}
                      loading={runningCritique}
                      trailingIcon={runningCritique ? undefined : <IconArrow size={14} />}
                    >
                      {runningCritique ? "Analyzing…" : "Run Critic Review"}
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card padding="md" tone="elevated">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-accent/10 ring-1 ring-accent/20 flex items-center justify-center text-accent">
                      <IconCheck size={18} />
                    </span>
                    <div className="flex flex-col">
                      <Body className="text-ink font-medium">Critic review clean</Body>
                      <BodySmall className="text-tertiary">No active issues in this section.</BodySmall>
                    </div>
                  </div>
                </Card>
              )}

              {/* Footer nav */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                {prev ? (
                  <button
                    type="button"
                    onClick={() => handleSelect(prev.key)}
                    className="inline-flex items-center gap-2 text-body-sm text-secondary hover:text-ink transition-colors"
                  >
                    <IconArrowLeft size={14} />
                    <span className="hidden sm:inline">{prev.title}</span>
                  </button>
                ) : (
                  <span />
                )}

                {next ? (
                  <button
                    type="button"
                    onClick={() => handleSelect(next.key)}
                    className="inline-flex items-center gap-2 text-body-sm text-secondary hover:text-ink transition-colors"
                  >
                    <span className="hidden sm:inline">{next.title}</span>
                    <IconArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => router.push("/export")}
                    className="inline-flex items-center gap-2 text-body-sm text-accent hover:text-accent-hover transition-colors"
                  >
                    <span>Export</span>
                    <IconArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
