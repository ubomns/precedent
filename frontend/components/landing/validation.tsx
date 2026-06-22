"use client";

import { Card } from "@/components/design-system/card";
import { Caption } from "@/components/design-system/typography";

export function Validation() {
  return (
    <section
      id="validation"
      aria-label="Validation"
      className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-content">
        <Card
          data-reveal
          padding="lg"
          className="relative overflow-hidden"
        >
          <div
            className="absolute left-0 top-0 h-full w-1 bg-accent"
            aria-hidden="true"
          />

          <blockquote className="relative pl-6">
            <Caption className="mb-4 inline-block uppercase tracking-[0.14em] text-secondary">
              Illustrative example
            </Caption>
            <p className="text-h3 font-medium leading-[1.3] tracking-[-0.01em] text-ink">
              &ldquo;What surprised me was how closely the output matched our house
              template structure. The Security Controls and User Access Management
              sections were not afterthoughts — they were properly framed from the
              start.&rdquo;
            </p>
            <footer className="mt-6 flex flex-col gap-1">
              <Caption className="text-secondary">
                Representative of the feedback Precedent is built to earn — not a
                sourced customer quote.
              </Caption>
            </footer>
          </blockquote>
        </Card>
      </div>
    </section>
  );
}
