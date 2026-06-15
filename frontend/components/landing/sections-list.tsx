"use client";

import { Card } from "@/components/design-system/card";
import { Heading2, Body, Mono } from "@/components/design-system/typography";

const SECTIONS = [
  { id: "01", name: "Executive Summary" },
  { id: "02", name: "Business Objective" },
  { id: "03", name: "Scope (in / out)" },
  { id: "04", name: "Stakeholders & RACI" },
  { id: "05", name: "Functional Requirements" },
  { id: "06", name: "Non-Functional Requirements" },
  { id: "07", name: "Assumptions" },
  { id: "08", name: "Constraints" },
  { id: "09", name: "Acceptance Criteria" },
  { id: "10", name: "User Access Management" },
  { id: "11", name: "Security Controls" },
  { id: "12", name: "Benefits Realisation" },
];

export function SectionsList() {
  return (
    <section
      id="sections"
      aria-label="The 12 BRD sections"
      className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-content">
        <div data-reveal className="mb-12 text-center lg:mb-16">
          <Heading2>The 12 sections</Heading2>
          <Body className="mx-auto mt-4 text-secondary">
            Every generated BRD includes all 12 sections against a typed schema.
            The output is structured, not prose soup.
          </Body>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4">
          {SECTIONS.map((section) => (
            <Card
              key={section.id}
              data-reveal
              padding="md"
              className="group flex items-center gap-4 transition-colors hover:bg-surface-2"
            >
              <Mono className="w-10 shrink-0 text-lg text-accent">{section.id}</Mono>
              <span className="text-base font-medium text-ink">{section.name}</span>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
