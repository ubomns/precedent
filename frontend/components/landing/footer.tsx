"use client";

import { Caption } from "@/components/design-system/typography";

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-content flex-col items-center justify-between gap-3 sm:flex-row">
        <Caption className="text-tertiary">Precedent v1 · 2026</Caption>
        <Caption className="text-tertiary">
          Team house templates coming in v1.1
        </Caption>
      </div>
    </footer>
  );
}
