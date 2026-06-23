"use client";

import { Card } from "@/components/design-system/card";
import { Button } from "@/components/design-system/button";
import { Heading2, Heading3, Body, Mono } from "@/components/design-system/typography";
import { IconCheck } from "@/components/icons";

type Plan = {
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    blurb: "Try the full workflow on real projects.",
    features: [
      "10 complete BRDs",
      "All 12 sections, drafter + critic",
      "Up to 30 refinements per day",
      "Word (.docx) export",
    ],
    cta: "Start free",
    href: "/signup?next=/intake",
  },
  {
    name: "Pro",
    price: "$15",
    cadence: "per month",
    blurb: "For Business Analysts shipping BRDs every week.",
    features: [
      "Unlimited BRDs",
      "Unlimited refinements & critique",
      "All 12 sections, drafter + critic",
      "Word (.docx) export",
      "Priority generation",
    ],
    cta: "Go Pro",
    href: "/signup?next=/intake&plan=pro",
    featured: true,
  },
];

export function Pricing() {
  return (
    <section
      id="pricing"
      aria-label="Pricing"
      className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-content">
        <div data-reveal className="mb-12 text-center lg:mb-16">
          <Heading2>Simple, honest pricing</Heading2>
          <Body className="mx-auto mt-4 max-w-[55ch] text-secondary">
            Start free with 10 full BRDs. Upgrade to Pro for $15/month when you need
            unlimited generations — cancel anytime.
          </Body>
        </div>

        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              data-reveal
              padding="lg"
              className={`relative flex flex-col ${
                plan.featured ? "ring-1 ring-accent/40" : ""
              }`}
            >
              {plan.featured ? (
                <span className="absolute right-5 top-5 rounded-full bg-accent/10 px-2.5 py-1 text-eyebrow uppercase tracking-[0.18em] text-accent">
                  Popular
                </span>
              ) : null}

              <Heading3 className="mb-1">{plan.name}</Heading3>
              <div className="mb-4 flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight text-ink">
                  {plan.price}
                </span>
                <Mono className="text-tertiary">{plan.cadence}</Mono>
              </div>
              <Body className="mb-6 text-secondary">{plan.blurb}</Body>

              <ul className="mb-8 flex flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <span className="mt-0.5 text-accent">
                      <IconCheck size={16} />
                    </span>
                    <span className="text-body-sm text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <Button
                  href={plan.href}
                  variant={plan.featured ? "primary" : "secondary"}
                  fullWidth
                >
                  {plan.cta}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Body data-reveal className="mx-auto mt-10 max-w-[55ch] text-center text-tertiary">
          Need team or enterprise seats?{" "}
          <a
            href="mailto:hello@nsikak.dev?subject=Precedent%20team%20pricing"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            Talk to us
          </a>
          .
        </Body>
      </div>
    </section>
  );
}
