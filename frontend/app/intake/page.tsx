"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import {
  DoubleBezel,
  PillCTA,
  FieldLabel,
  TextField,
  TextArea,
  Eyebrow,
  GlassNav,
} from "@/components/primitives";
import { IconX, IconArrow } from "@/components/icons";

const DEFAULT_STAKEHOLDERS = [
  { name: "Priya Anand", role: "Head of Compliance" },
  { name: "Marcus Wei", role: "Platform Lead" },
  { name: "", role: "" },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

/* ─── Generation steps shown in the fixed overlay ─── */
const STEPS = [
  "Reading brief…",
  "Drafting business objectives…",
  "Mapping functional requirements…",
  "Outlining non-functional requirements…",
  "Charting user journeys…",
  "Designing data model…",
  "Defining acceptance criteria…",
  "Assigning RACI owners…",
  "Capturing risks & dependencies…",
  "Identifying assumptions…",
  "Stitching sections together…",
  "Finalising document…",
];

export default function IntakePage() {
  const router = useRouter();
  const { setBrief, setBRD, setGenerating } = useAppStore();

  const [data, setData] = useState({
    objective:
      "Expose Meridian core banking primitives (accounts, payments, KYC events) through a versioned REST + webhook API for accredited partner fintechs operating in EU and UK markets.",
    stakeholders: DEFAULT_STAKEHOLDERS,
    scopeIn:
      "• Account read/write\n• ACH + SEPA payment initiation\n• Webhooks for ledger events\n• OAuth2 partner onboarding",
    scopeOut:
      "• Retail-facing UI\n• Cross-border FX execution\n• Card issuance\n• Customer support tooling",
    users: "Engineering teams at tier-2 EU/UK fintech partners",
    regulatory:
      "PSD2 SCA, GDPR Art. 32, FCA Operational Resilience (PS21/3), and internal MNPI handling policy.",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  /* Animated step for the overlay */
  const [stepIndex, setStepIndex] = useState(0);
  useEffect(() => {
    if (!submitting) return;
    setStepIndex(0);
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= STEPS.length - 1) return prev;
        return prev + 1;
      });
    }, 2100);
    return () => clearInterval(interval);
  }, [submitting]);

  const progress = useMemo(
    () => Math.min(100, Math.round((stepIndex / (STEPS.length - 1)) * 100)),
    [stepIndex]
  );

  const set = (k: string) => (v: string) => setData((d) => ({ ...d, [k]: v }));

  const setStakeholder = (i: number, key: "name" | "role", v: string) => {
    setData((d) => {
      const next = d.stakeholders.slice();
      next[i] = { ...next[i], [key]: v };
      return { ...d, stakeholders: next };
    });
  };

  const addStakeholder = () =>
    setData((d) => ({
      ...d,
      stakeholders: [...d.stakeholders, { name: "", role: "" }],
    }));

  const removeStakeholder = (i: number) =>
    setData((d) => {
      if (d.stakeholders.length <= 1) return d;
      const next = d.stakeholders.slice();
      next.splice(i, 1);
      return { ...d, stakeholders: next };
    });

  const handleGenerate = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError("");
    setGenerating(true);

    const brief = {
      project_objective: data.objective,
      stakeholders: data.stakeholders.filter(
        (s) => s.name.trim() && s.role.trim()
      ),
      scope_in: data.scopeIn.split("\n").filter(Boolean),
      scope_out: data.scopeOut.split("\n").filter(Boolean),
      target_users: data.users,
      regulatory_context: data.regulatory,
    };

    setBrief(brief);

    try {
      const res = await fetch(`${API_BASE}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brief),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || `HTTP ${res.status}`);
      }

      const responseData = await res.json();
      setBRD(responseData.brd);
      router.push("/review");
    } catch (err: any) {
      setError(err.message || "Failed to generate BRD. Please try again.");
      setSubmitting(false);
      setGenerating(false);
    }
  };

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

      {/* ─── Fixed generation overlay ─── */}
      <AnimatePresence>
        {submitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#050505]/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
              className="relative mx-6 w-full max-w-[480px] rounded-2xl bg-white/[0.03] ring-1 ring-white/10 p-8 text-center"
            >
              {/* Spinner */}
              <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
                <span className="block h-5 w-5 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
              </div>

              <h2 className="text-lg font-medium tracking-tight text-ink">
                Generating your BRD
              </h2>
              <p className="mt-1.5 text-sm text-secondary">
                Drafter agent at work
              </p>

              {/* Progress bar */}
              <div className="mt-6 mb-3 h-[3px] w-full overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className="h-full rounded-full bg-emerald-500"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>

              {/* Current step label */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={stepIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="text-[13px] font-mono tracking-tight text-tertiary"
                >
                  {STEPS[stepIndex]}
                </motion.p>
              </AnimatePresence>

              <p className="mt-4 text-[11px] text-tertiary font-mono tracking-tight">
                ~30 seconds · Drafter
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top nav */}
      <header className="relative z-10">
        <GlassNav active="Intake" canReview={false} />
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
          <Eyebrow>Business Requirements Document Generator</Eyebrow>
          <h1 className="mt-6 text-4xl md:text-5xl tracking-tight text-ink font-semibold leading-[1.1]">
            From brief to BRD.
          </h1>
          <p className="mt-4 text-lg text-secondary max-w-[55ch] leading-relaxed">
            Enter what only you know. We&apos;ll handle the structure.
          </p>
        </motion.div>

        {/* Form card */}
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
            <div className="flex flex-col gap-7">
              {/* Project Objective */}
              <div>
                <FieldLabel htmlFor="objective" hint="01 · context">
                  Project Objective
                </FieldLabel>
                <TextArea
                  id="objective"
                  rows={4}
                  value={data.objective}
                  onChange={set("objective")}
                  placeholder="What is being built, for whom, and why now?"
                />
              </div>

              {/* Stakeholders */}
              <div>
                <FieldLabel hint={`02 · ${data.stakeholders.length} people`}>
                  Stakeholders
                </FieldLabel>
                <div className="flex flex-col gap-2.5">
                  {data.stakeholders.map((s, i) => (
                    <div
                      key={i}
                      className="flex gap-2.5 items-end"
                    >
                      <input
                        value={s.name}
                        onChange={(e) =>
                          setStakeholder(i, "name", e.target.value)
                        }
                        placeholder="Name"
                        className="field flex-1 min-w-0 bg-surface-2 border border-white/10 rounded-xl px-4 py-2.5 text-[13.5px] text-ink placeholder:text-tertiary"
                      />
                      <input
                        value={s.role}
                        onChange={(e) =>
                          setStakeholder(i, "role", e.target.value)
                        }
                        placeholder="Role"
                        className="field flex-1 min-w-0 bg-surface-2 border border-white/10 rounded-xl px-4 py-2.5 text-[13.5px] text-ink placeholder:text-tertiary"
                      />
                      <button
                        onClick={() => removeStakeholder(i)}
                        className="w-9 h-9 rounded-full border border-white/10 bg-white/[0.02] text-tertiary hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 flex items-center justify-center transition-colors shrink-0"
                        aria-label="Remove stakeholder"
                      >
                        <IconX size={13} />
                      </button>
                    </div>
                  ))}

                  {/* Add stakeholder — dashed border style from HTML */}
                  <button
                    onClick={addStakeholder}
                    className="self-start mt-1 inline-flex items-center gap-1.5 text-[13px] text-secondary hover:text-emerald-400 transition-colors rounded-full px-4 py-2 border border-dashed border-white/15 hover:border-emerald-500/40"
                  >
                    <span className="text-lg leading-none">+</span>
                    Add stakeholder
                  </button>
                </div>
              </div>

              {/* Scope (side-by-side inside the card) */}
              <div>
                <FieldLabel hint="03 · boundaries">Scope</FieldLabel>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-emerald-400/80 mb-1.5 tracking-wider">
                      IN
                    </span>
                    <TextArea
                      rows={5}
                      value={data.scopeIn}
                      onChange={set("scopeIn")}
                      placeholder="• What's in"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-tertiary mb-1.5 tracking-wider">
                      OUT
                    </span>
                    <TextArea
                      rows={5}
                      value={data.scopeOut}
                      onChange={set("scopeOut")}
                      placeholder="• What's out"
                    />
                  </div>
                </div>
              </div>

              {/* Target Users */}
              <div>
                <FieldLabel htmlFor="users" hint="04 · audience">
                  Target Users
                </FieldLabel>
                <TextField
                  id="users"
                  value={data.users}
                  onChange={set("users")}
                  placeholder="Who will use what's built?"
                />
              </div>

              {/* Regulatory Context */}
              <div>
                <FieldLabel htmlFor="reg" hint="05 · constraints">
                  Regulatory Context
                </FieldLabel>
                <TextArea
                  id="reg"
                  rows={3}
                  value={data.regulatory}
                  onChange={set("regulatory")}
                  placeholder="Standards, jurisdictions, internal policies"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-rose-400">
                  {error}
                </div>
              )}

              {/* Generate CTA */}
              <div className="pt-2">
                <PillCTA
                  fullWidth
                  onClick={handleGenerate}
                  loading={submitting}
                  trailingIcon={submitting ? null : <IconArrow size={14} />}
                >
                  {submitting ? "Drafting your BRD…" : "Generate BRD"}
                </PillCTA>
                <p className="mt-3 text-center text-[11px] text-tertiary font-mono tracking-tight">
                  Drafter agent &nbsp;·&nbsp; ~ 30 seconds
                </p>
              </div>
            </div>
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
