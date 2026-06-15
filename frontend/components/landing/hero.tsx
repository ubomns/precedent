"use client";

import { HeroSceneDynamic } from "@/components/three/hero-scene-dynamic";
import { Button } from "@/components/design-system/button";
import { Eyebrow, Display, BodyLarge } from "@/components/design-system/typography";
import { IconChevronDown, IconDownload } from "@/components/icons";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function Hero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      aria-label="Hero"
      className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8"
    >
      <HeroSceneDynamic dpr={2} maxParticles={200} />

      <div className="relative z-10 mx-auto flex max-w-content flex-col items-center text-center">
        <div data-reveal>
          <Eyebrow className="mb-6">Business Requirements Document Generator</Eyebrow>
        </div>

        <div data-reveal>
          <Display className="max-w-[800px]">
            The BRD shouldn&apos;t be the hardest part of your job.
          </Display>
        </div>

        <div data-reveal>
          <BodyLarge className="mx-auto mt-6 text-secondary md:mt-8">
            Precedent turns a structured project brief into a near-complete Business
            Requirements Document — 12 sections, schema-driven, with a built-in critic
            agent that catches what a second reviewer would catch. Validated with
            practising BAs in regulated environments.
          </BodyLarge>
        </div>

        <div
          data-reveal
          className="mt-8 flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-center md:mt-10"
        >
          <Button href="/intake" size="lg" className="w-full sm:w-auto">
            Generate my BRD — free to try
          </Button>
          <Button
            href="/sample-brd.docx"
            download
            variant="secondary"
            size="lg"
            trailingIcon={<IconDownload size={18} />}
            className="w-full sm:w-auto"
          >
            Download a sample BRD
          </Button>
        </div>
      </div>

      <a
        href="#problem"
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-secondary transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-full p-2"
        aria-label="Scroll to problem section"
      >
        <span className="text-caption uppercase tracking-[0.12em]">Scroll</span>
        <IconChevronDown
          size={20}
          className={prefersReducedMotion ? "" : "animate-bounce-subtle"}
        />
      </a>
    </section>
  );
}
