"use client";

import { Card } from "@/components/design-system/card";
import { Heading2, Heading3, Body, Mono } from "@/components/design-system/typography";

const STEPS = [
  {
    number: "01",
    title: "Fill in the brief",
    body: "Enter what only you know: the project objective, stakeholders, scope boundaries, target users, and regulatory context. No guessing, no invented context.",
  },
  {
    number: "02",
    title: "Precedent drafts 12 sections",
    body: "A drafter agent generates each BRD section against a typed schema. An independent critic agent reviews every section and surfaces issues by severity — high, medium, and low.",
  },
  {
    number: "03",
    title: "Export to Word",
    body: "Download a fully formatted .docx that matches standard enterprise BRD conventions — heading styles, numbered requirements, RACI tables, and all 12 sections ready for your team's review.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-label="How it works"
      className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-content">
        <div data-reveal className="mb-12 text-center lg:mb-16">
          <Heading2>How it works</Heading2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <Card
              key={step.number}
              data-reveal
              padding="lg"
              className="group relative flex flex-col"
            >
              <Mono className="mb-4 text-2xl text-accent">{step.number}</Mono>
              <Heading3 className="mb-3">{step.title}</Heading3>
              <Body className="text-secondary">{step.body}</Body>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
