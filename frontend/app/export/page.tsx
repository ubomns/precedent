"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { DoubleBezel, PillCTA, GlassNav } from "@/components/primitives";
import { IconDownload, IconDoc, IconCheck, IconArrow } from "@/components/icons";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

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

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 50);
}

export default function ExportPage() {
  const router = useRouter();
  const { brd, brief, visitedSections } = useAppStore();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!brd) return;
    setExporting(true);
    try {
      const res = await fetch(`${API_BASE}/api/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brd,
          project_name: brief?.project_objective || "",
        }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      const filename = brief?.project_objective
        ? `${sanitizeFilename(brief.project_objective)}_BRD.docx`
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
  };

  const allVisited = visitedSections.size === SECTIONS.length;
  const progressPct = Math.round((visitedSections.size / SECTIONS.length) * 100);

  return (
    <div className="relative min-h-[100dvh] flex flex-col">
      {/* Ambient vignette */}
      <div
        className="vignette absolute pointer-events-none"
        style={{
          width: 900,
          height: 900,
          top: "45%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Top nav */}
      <header className="relative z-10">
        <GlassNav active="Export" canReview={true} />
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-6 pt-16 pb-24">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}
          className="flex flex-col items-center text-center max-w-[640px] mb-10"
        >
          <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-tertiary ring-1 ring-white/10 bg-white/[0.025]">
            Export
          </span>
          <h1 className="mt-6 text-4xl md:text-5xl tracking-tight text-ink font-semibold leading-[1.1]">
            Ready to export.
          </h1>
          <p className="mt-4 text-lg text-secondary max-w-[55ch] leading-relaxed">
            Download your complete BRD as a Word document, or return to review
            any sections first.
          </p>
        </motion.div>

        {/* Export card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.15,
            ease: [0.32, 0.72, 0, 1],
          }}
          className="w-full max-w-[640px]"
        >
          <DoubleBezel padding="p-8 md:p-10">
            {!brd ? (
              <div className="flex flex-col items-center text-center gap-5">
                <span className="w-12 h-12 rounded-full bg-amber-500/10 ring-1 ring-amber-500/20 flex items-center justify-center text-amber-400">
                  <IconDoc size={20} />
                </span>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[15px] font-medium tracking-tight text-ink">
                    No BRD generated yet
                  </span>
                  <span className="text-[13px] text-secondary max-w-[45ch] leading-relaxed">
                    Generate a BRD from the intake form first, then return here to export.
                  </span>
                </div>
                <PillCTA
                  onClick={() => router.push("/intake")}
                  trailingIcon={<IconArrow size={14} />}
                >
                  Go to Intake
                </PillCTA>
              </div>
            ) : (
            <div className="flex flex-col gap-8">
              {/* Project info */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-[0.18em] text-tertiary font-medium">
                  Project
                </span>
                <span className="text-[15px] font-medium text-ink tracking-tight leading-snug break-words">
                  {brief?.project_objective || "Project"}
                </span>
                <span className="text-[11px] font-mono text-tertiary">
                  brd-2026-0418
                </span>
              </div>

              <div className="border-t hairline" />

              {/* Section checklist */}
              <div className="flex flex-col gap-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-tertiary font-medium">
                    Sections
                  </span>
                  <span className="text-[11px] font-mono text-secondary tabular-nums">
                    {visitedSections.size} / {SECTIONS.length} reviewed
                  </span>
                </div>

                <div className="h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-700"
                    style={{
                      width: `${progressPct}%`,
                      boxShadow: "0 0 8px rgba(16,185,129,0.5)",
                    }}
                  />
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SECTIONS.map((s) => {
                    const visited = visitedSections.has(s.key);
                    return (
                      <li
                        key={s.key}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] tracking-tight"
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                            visited
                              ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
                              : "bg-white/[0.04] text-tertiary ring-1 ring-white/10"
                          }`}
                        >
                          {visited ? (
                            <IconCheck size={11} />
                          ) : (
                            <span className="text-[9px] font-mono">
                              {s.n}
                            </span>
                          )}
                        </span>
                        <span
                          className={
                            visited ? "text-ink" : "text-tertiary"
                          }
                        >
                          {s.title}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="border-t hairline" />

              {/* Export actions */}
              <div className="flex flex-col gap-4">
                {!allVisited && (
                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-sm text-amber-400">
                    {SECTIONS.length - visitedSections.size} sections still
                    need review before final export.
                  </div>
                )}

                <PillCTA
                  fullWidth
                  onClick={handleExport}
                  loading={exporting}
                  trailingIcon={
                    exporting ? null : <IconDownload size={14} />
                  }
                >
                  {exporting ? "Generating document…" : "Export to Word"}
                </PillCTA>

                <button
                  onClick={() => router.push("/review")}
                  className="self-center text-[13px] text-tertiary hover:text-ink transition-colors"
                >
                  Return to review
                </button>
              </div>
            </div>
            )}
          </DoubleBezel>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 pb-6 pt-2 text-center text-sm text-tertiary">
        Precedent v1 · 2026
      </footer>
    </div>
  );
}
