"use client";

import { Button } from "@/components/design-system/button";
import { Card } from "@/components/design-system/card";
import { Heading2, Body, Caption } from "@/components/design-system/typography";
import { IconDownload, IconDoc } from "@/components/icons";

export function SampleOutput() {
  return (
    <section
      id="sample"
      aria-label="Sample output"
      className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-content">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div data-reveal className="order-2 lg:order-1">
            <Heading2 className="mb-6">See the output before you commit</Heading2>
            <Body className="text-secondary">
              A BA cannot trust a tool they cannot preview. Download a sample BRD to
              see the structure, numbering, and formatting before you commit.
            </Body>
            <Button
              href="/sample-brd.docx"
              download
              size="lg"
              trailingIcon={<IconDownload size={18} />}
              className="mt-8 w-full sm:w-auto"
            >
              Download a sample BRD
            </Button>
          </div>

          <div data-reveal className="order-1 lg:order-2">
            <Card padding="none" className="overflow-hidden bg-surface-2">
              {/* Document chrome */}
              <div className="flex items-center gap-2 border-b border-white/10 bg-surface px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-tertiary/50" aria-hidden="true" />
                <span className="h-2.5 w-2.5 rounded-full bg-tertiary/50" aria-hidden="true" />
                <span className="h-2.5 w-2.5 rounded-full bg-tertiary/50" aria-hidden="true" />
                <Caption className="ml-auto text-tertiary">sample-brd.docx</Caption>
              </div>

              {/* Document page */}
              <div className="bg-[#0f0f0f] p-6 sm:p-8">
                <div className="mx-auto max-w-[360px] rounded-sm bg-ground p-6 shadow-[0_8px_32px_-12px_var(--shadow-color)]">
                  <div className="mb-4 text-center">
                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-md bg-accent/10 text-accent">
                      <IconDoc size={18} />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                      Business Requirements Document
                    </p>
                    <p className="mt-1 text-sm font-medium text-ink">
                      Customer Portal — Insurance Renewals & Claims
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="h-1.5 w-3/4 rounded bg-white/10" />
                    <div className="h-1.5 w-full rounded bg-white/10" />
                    <div className="h-1.5 w-5/6 rounded bg-white/10" />
                  </div>

                  <div className="mt-5 space-y-1.5">
                    <p className="text-xs font-medium text-secondary">1. Executive Summary</p>
                    <div className="h-1 w-full rounded bg-white/5" />
                    <div className="h-1 w-11/12 rounded bg-white/5" />
                  </div>

                  <div className="mt-4 space-y-1.5">
                    <p className="text-xs font-medium text-secondary">5. Functional Requirements</p>
                    <div className="h-1 w-full rounded bg-white/5" />
                    <div className="h-1 w-10/12 rounded bg-white/5" />
                    <div className="h-1 w-11/12 rounded bg-white/5" />
                  </div>

                  <div className="mt-4 space-y-1.5">
                    <p className="text-xs font-medium text-secondary">11. Security Controls</p>
                    <div className="h-1 w-full rounded bg-white/5" />
                    <div className="h-1 w-9/12 rounded bg-white/5" />
                  </div>

                  <div className="mt-5 border-t border-white/10 pt-3">
                    <div className="flex items-center justify-between text-[10px] text-tertiary">
                      <span>12 sections</span>
                      <span>.docx format</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
