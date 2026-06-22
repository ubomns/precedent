"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Card, Heading2, BodySmall } from "@/components/design-system";
import { LogoIcon } from "@/components/icons";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-16 bg-ground">
      <Link href="/" className="flex items-center gap-2.5 mb-8">
        <LogoIcon size={20} />
        <span className="text-base font-medium tracking-tight text-ink">
          Precedent
        </span>
      </Link>
      <Card padding="md" className="w-full max-w-[420px]">
        <div className="flex flex-col gap-1.5 mb-6">
          <Heading2>{title}</Heading2>
          {subtitle ? (
            <BodySmall className="text-secondary">{subtitle}</BodySmall>
          ) : null}
        </div>
        {children}
      </Card>
      {footer ? (
        <div className="mt-6 text-caption text-tertiary">{footer}</div>
      ) : null}
    </main>
  );
}
