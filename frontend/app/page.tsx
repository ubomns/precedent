"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { IconChevron, LogoIcon } from "@/components/icons";

export default function LauncherPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-12 gap-12 bg-ground">
      {/* Brand */}
      <motion.div
        initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}
        className="flex flex-col items-center text-center gap-4"
      >
        <LogoIcon size={44} />
        <h1 className="text-[clamp(2rem,5vw,3rem)] font-semibold tracking-[-0.03em] text-ink">
          Precedent
        </h1>
        <p className="text-base text-secondary max-w-[50ch] leading-relaxed">
          An AI-powered BRD generator for Business Analysts in regulated
          environments. Transform structured briefs into complete Business
          Requirements Documents with intelligent drafter and critic agents.
        </p>
      </motion.div>

      {/* Screen cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.32, 0.72, 0, 1] }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-[720px]"
      >
        <Link
          href="/intake"
          className="group relative bg-white/[0.05] ring-1 ring-white/10 p-1.5 rounded-card shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:ring-white/20 transition-all"
        >
          <div className="bg-surface bezel-inner-shadow rounded-card-inner p-8 flex flex-col gap-4 h-full">
             <span className="self-start text-[0.65rem] uppercase tracking-[0.15em] text-emerald-400 bg-emerald-500/[0.08] border border-emerald-500/15 rounded-full px-3 py-1">
               Start
             </span>
             <h2 className="text-xl font-semibold tracking-[-0.01em] text-ink">
               Brief Intake
             </h2>
             <p className="text-sm text-secondary leading-relaxed flex-1">
               Capture project objectives, stakeholders, scope boundaries, target
               users, and regulatory context in a structured brief.
             </p>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-ink group-hover:text-emerald-400 transition-colors">
              Open intake
              <IconChevron size={14} className="transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>

        <Link
          href="/review"
          className="group relative bg-white/[0.05] ring-1 ring-white/10 p-1.5 rounded-card shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:ring-white/20 transition-all"
        >
          <div className="bg-surface bezel-inner-shadow rounded-card-inner p-8 flex flex-col gap-4 h-full">
             <span className="self-start text-[0.65rem] uppercase tracking-[0.15em] text-emerald-400 bg-emerald-500/[0.08] border border-emerald-500/15 rounded-full px-3 py-1">
               Refine
             </span>
             <h2 className="text-xl font-semibold tracking-[-0.01em] text-ink">
               BRD Review
             </h2>
             <p className="text-sm text-secondary leading-relaxed flex-1">
               Review 12 drafted BRD sections with inline critic feedback,
               severity analysis, and one-click export to Word.
             </p>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-ink group-hover:text-emerald-400 transition-colors">
              Open review
              <IconChevron size={14} className="transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-xs text-tertiary"
      >
        Precedent v1 · 2026
      </motion.footer>
    </div>
  );
}
