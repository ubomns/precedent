"use client";

import { Nav } from "@/components/design-system/nav";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import {
  Hero,
  Problem,
  HowItWorks,
  SectionsList,
  SampleOutput,
  WhoItsFor,
  Validation,
  CtaFooter,
  Footer,
} from "@/components/landing";

const NAV_ITEMS = [
  { label: "Generate BRD", href: "/intake" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Sample", href: "#sample" },
  { label: "For teams", href: "#for-teams" },
];

export default function LandingPage() {
  return (
    <>
      <Nav items={NAV_ITEMS} />

      <main className="overflow-x-hidden">
        <Hero />

        <ScrollReveal as="div">
          <Problem />
        </ScrollReveal>

        <ScrollReveal as="div">
          <HowItWorks />
        </ScrollReveal>

        <ScrollReveal as="div">
          <SectionsList />
        </ScrollReveal>

        <ScrollReveal as="div">
          <SampleOutput />
        </ScrollReveal>

        <ScrollReveal as="div">
          <WhoItsFor />
        </ScrollReveal>

        <ScrollReveal as="div">
          <Validation />
        </ScrollReveal>

        <ScrollReveal as="div">
          <CtaFooter />
        </ScrollReveal>

        <Footer />
      </main>
    </>
  );
}
