"use client";

import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useAppStore } from "@/lib/store";
import { apiUrl, apiHeaders } from "@/lib/api";
import {
  Button,
  Card,
  Eyebrow,
  Heading1,
  BodyLarge,
  BodySmall,
} from "@/components/design-system";
import { Nav } from "@/components/design-system/nav";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  IconDownload,
  IconDoc,
  IconCheck,
  IconArrowRight,
} from "@/components/icons";

const SECTIONS = [
  { key: "executive_summary", title: "Executive Summary" },
  { key: "business_objective", title: "Business Objective" },
  { key: "scope", title: "Scope" },
  { key: "stakeholders", title: "Stakeholders" },
  { key: "functional_requirements", title: "Functional Requirements" },
  { key: "non_functional_requirements", title: "Non-Functional Requirements" },
  { key: "assumptions", title: "Assumptions" },
  { key: "constraints", title: "Constraints" },
  { key: "acceptance_criteria", title: "Acceptance Criteria" },
  { key: "user_access_management", title: "User Access Management" },
  { key: "security_controls", title: "Security Controls" },
  { key: "benefits_realization", title: "Benefits Realization" },
];

const DEFAULT_FILENAME_BASE = "precedent_brd";

function sanitizeFilename(name: string): string {
  const sanitized = name
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 50);
  return sanitized.length > 0 ? sanitized : DEFAULT_FILENAME_BASE;
}

function estimateWordCount(brd: Record<string, any>): number {
  try {
    const text = JSON.stringify(brd);
    return text.split(/\s+/).filter(Boolean).length;
  } catch {
    return 0;
  }
}

export default function ExportPage() {
  const router = useRouter();
  const { brd, brief, visitedSections } = useAppStore();
  const prefersReducedMotion = useReducedMotion();

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const checkRef = useRef<HTMLDivElement>(null);
  const downloadButtonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);

  const handleDownloadFocus = () => {
    if (prefersReducedMotion || !downloadButtonRef.current) return;
    gsap.fromTo(
      downloadButtonRef.current,
      { scale: 1 },
      { scale: 1.015, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" }
    );
  };

  const navItems = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Intake", href: "/intake" },
      { label: "Review", href: "/review" },
      { label: "Export", href: "/export" },
    ],
    []
  );

  const sectionCount = brd ? SECTIONS.filter((s) => s.key in brd).length : 0;
  const totalSections = SECTIONS.length;
  const wordCount = brd ? estimateWordCount(brd) : 0;
  const filename = brief?.project_objective
    ? `${sanitizeFilename(brief.project_objective)}_BRD.docx`
    : "BRD.docx";

  const handleExport = async () => {
    if (!brd || exporting) return;

    setExporting(true);
    setExportError("");

    if (checkRef.current && !prefersReducedMotion) {
      gsap.fromTo(
        checkRef.current,
        { scale: 0.8, opacity: 0.6 },
        { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
      );
    }

    try {
      const res = await fetch(apiUrl("/api/export"), {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({
          brd,
          project_name: brief?.project_objective || "",
        }),
      });

      if (!res.ok) {
        throw new Error("Export failed");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setExportError("Failed to export BRD. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] flex flex-col overflow-x-hidden">
      <div
        className="vignette absolute pointer-events-none"
        style={{
          width: 900,
          height: 900,
          top: "35%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      <Nav items={navItems} />

      <main className="relative z-0 flex-1 flex flex-col items-center px-4 sm:px-6 pt-24 sm:pt-28 pb-20 sm:pb-24">
        <div className="flex flex-col items-center text-center max-w-[640px] mb-8 sm:mb-10">
          <Eyebrow>Export</Eyebrow>
          <Heading1 className="mt-5 sm:mt-6">Your BRD is ready.</Heading1>
          <BodyLarge className="mt-4 text-secondary">
            Download your complete BRD as a Word document, or return to review
            any sections first.
          </BodyLarge>
        </div>

        <Card padding="md" className="w-full max-w-[560px]">
          {!brd ? (
            <div className="flex flex-col items-center text-center gap-5">
              <span className="w-12 h-12 rounded-full bg-amber-500/10 ring-1 ring-amber-500/20 flex items-center justify-center text-amber-400">
                <IconDoc size={20} />
              </span>
              <div className="flex flex-col gap-1.5">
                <span className="text-body-sm font-medium tracking-tight text-ink">
                  No BRD generated yet
                </span>
                <BodySmall>
                  Generate a BRD from the intake form first, then return here to
                  export.
                </BodySmall>
              </div>
              <Button
                variant="primary"
                onClick={() => router.push("/intake")}
                trailingIcon={<IconArrowRight size={14} />}
              >
                Go to Intake
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-6 sm:gap-8">
              <div className="flex flex-col items-center text-center gap-4">
                <div
                  ref={checkRef}
                  className="w-16 h-16 rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20 flex items-center justify-center text-emerald-400"
                >
                  <IconCheck size={28} />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-body font-medium text-ink tracking-tight">
                    {brief?.project_objective || "Project BRD"}
                  </span>
                  <span className="text-caption text-tertiary font-mono">
                    {filename} · {sectionCount} of {totalSections} sections ·{" "}
                    {wordCount.toLocaleString()} words
                  </span>
                </div>
              </div>

              <div className="h-px bg-white/[0.06]" />

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-caption uppercase tracking-[0.1em] text-secondary font-medium">
                    Reviewed
                  </span>
                  <span className="text-caption text-tertiary font-mono tabular-nums">
                    {visitedSections.size} / {totalSections}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-700"
                    style={{
                      width: `${Math.round(
                        (visitedSections.size / totalSections) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {exportError && (
                <div
                  className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-[var(--badge-high-text)]"
                  role="alert"
                >
                  {exportError}
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2">
                <Button
                  ref={downloadButtonRef}
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleExport}
                  loading={exporting}
                  trailingIcon={
                    exporting ? undefined : <IconDownload size={16} />
                  }
                  onFocus={handleDownloadFocus}
                >
                  {exporting ? "Generating document…" : "Download .docx"}
                </Button>

                <Button
                  variant="ghost"
                  size="md"
                  fullWidth
                  onClick={() => router.push("/review")}
                >
                  Back to review
                </Button>
              </div>
            </div>
          )}
        </Card>
      </main>

      <footer className="relative z-10 pb-6 pt-2 text-center text-sm text-tertiary">
        Precedent v1 · 2026
      </footer>
    </div>
  );
}
