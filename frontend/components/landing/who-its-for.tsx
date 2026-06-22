"use client";

import { Card } from "@/components/design-system/card";
import { Heading2, Body } from "@/components/design-system/typography";
import {
  IconBank,
  IconShieldCheck,
  IconHeartbeat,
  IconBuilding,
  IconServer,
} from "@/components/icons";

const INDUSTRIES = [
  { label: "Banking", icon: IconBank },
  { label: "Insurance", icon: IconShieldCheck },
  { label: "Healthcare", icon: IconHeartbeat },
  { label: "Public sector", icon: IconBuilding },
  { label: "Enterprise IT", icon: IconServer },
];

export function WhoItsFor() {
  return (
    <section
      id="for-teams"
      aria-label="Who it is for"
      className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-content">
        <div data-reveal className="mb-12 text-center lg:mb-16">
          <Heading2>Built for regulated environments</Heading2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
          {INDUSTRIES.map(({ label, icon: Icon }) => (
            <Card
              key={label}
              data-reveal
              padding="md"
              className="flex flex-col items-center gap-3 text-center transition-colors hover:bg-surface-2"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                <Icon size={20} />
              </div>
              <span className="text-sm font-medium text-ink">{label}</span>
            </Card>
          ))}
        </div>

        <div data-reveal className="mx-auto mt-12 max-w-[65ch] text-center">
          <Body className="text-secondary">
            Precedent is built for Business Analysts working in regulated environments
            — banking, insurance, healthcare, public sector, and enterprise IT — where
            a BRD is not optional and the format is not negotiable.
          </Body>
          <Body className="mt-4 text-secondary">
            If your team has a house template, Precedent&apos;s default Word output
            follows standard enterprise conventions. Template upload is on the roadmap
            for v1.1. If you work independently, the default template is clean,
            numbered, and ready to submit.
          </Body>
          <Body className="mt-6 text-secondary">
            Team and enterprise pricing available —{" "}
            <a
              href="mailto:hello@nsikak.dev?subject=Precedent%20team%20pricing"
              className="font-medium text-accent underline-offset-4 hover:underline"
            >
              contact hello@nsikak.dev
            </a>
            .
          </Body>
        </div>
      </div>
    </section>
  );
}
