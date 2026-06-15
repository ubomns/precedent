"use client";

import { Heading2, Body } from "@/components/design-system/typography";

export function Problem() {
  return (
    <section
      id="problem"
      aria-label="The problem"
      className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-content">
        <div className="mx-auto max-w-[65ch] text-center">
          <div data-reveal>
            <Heading2 className="mb-8">
              You handle the thinking. We handle the structure.
            </Heading2>
          </div>

          <div data-reveal>
            <Body className="text-body-lg text-secondary">
              You know what a good BRD looks like. You&apos;ve written dozens of them.
              The problem isn&apos;t skill — it&apos;s the structural writing that has to
              happen before you get to the thinking that actually requires you.
            </Body>
          </div>

          <div data-reveal>
            <Body className="mt-6 text-body-lg text-secondary">
              By the time you&apos;ve drafted the Executive Summary, the Scope
              boundaries, the Stakeholder matrix, and the Functional Requirements
              table, the document is six pages long and you haven&apos;t written a single
              sentence that required your judgment yet.
            </Body>
          </div>

          <div data-reveal>
            <p className="mt-10 font-semibold text-ink text-h3">
              Precedent handles the structure. You handle the thinking.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
