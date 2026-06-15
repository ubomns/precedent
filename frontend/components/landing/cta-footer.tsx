"use client";

import { Button } from "@/components/design-system/button";
import { Heading2, Body } from "@/components/design-system/typography";
import { IconDownload } from "@/components/icons";

export function CtaFooter() {
  return (
    <section
      aria-label="Get started"
      className="bg-surface px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-content text-center">
        <div data-reveal>
          <Heading2 className="mb-4">Ready to draft your next BRD?</Heading2>
        </div>

        <div data-reveal>
          <Body className="mx-auto text-secondary">
            Free to try. No account required for your first document.
          </Body>
        </div>

        <div
          data-reveal
          className="mt-8 flex w-full flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button href="/intake" size="lg" className="w-full sm:w-auto">
            Generate my BRD
          </Button>
          <Button
            href="/sample-brd.docx"
            download
            variant="secondary"
            size="lg"
            trailingIcon={<IconDownload size={18} />}
            className="w-full sm:w-auto"
          >
            Download a sample first
          </Button>
        </div>
      </div>
    </section>
  );
}
