"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Nav } from "@/components/design-system/nav";
import { Card } from "@/components/design-system/card";
import { Button } from "@/components/design-system/button";
import { Heading2, Heading3, Body, Mono } from "@/components/design-system/typography";
import { AuthNavActions } from "@/components/auth/auth-nav-actions";
import {
  getBillingStatus,
  startCheckout,
  openBillingPortal,
  type BillingStatus,
} from "@/lib/billing";

const NAV_ITEMS = [{ label: "Generate BRD", href: "/intake" }];

function AccountInner() {
  const params = useSearchParams();
  const checkout = params.get("checkout"); // success | cancelled
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getBillingStatus()
      .then(setStatus)
      .catch((e) => setError(e.message));
  }, []);

  const onAction = async (fn: () => Promise<void>) => {
    setError("");
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  };

  const subscribed = status?.is_subscribed;

  return (
    <>
      <Nav items={NAV_ITEMS} actions={<AuthNavActions />} />
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:py-24">
        <Heading2 className="mb-8">Account</Heading2>

        {checkout === "success" ? (
          <div className="mb-6 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-body-sm text-ink">
            Thanks for subscribing — your plan is now Pro. It may take a moment to reflect.
          </div>
        ) : null}
        {checkout === "cancelled" ? (
          <div className="mb-6 rounded-lg border border-border-strong bg-surface-2 px-4 py-3 text-body-sm text-secondary">
            Checkout cancelled — no charge was made.
          </div>
        ) : null}

        <Card padding="lg" className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Heading3 className="mb-1">
                {subscribed ? "Pro" : "Free"} plan
              </Heading3>
              <Body className="text-secondary">
                {subscribed
                  ? "Unlimited BRDs and refinements."
                  : `Up to ${status?.free_limit ?? 10} BRDs, then upgrade for unlimited.`}
              </Body>
            </div>
            <Mono className="text-tertiary">{subscribed ? "$15/mo" : "$0"}</Mono>
          </div>

          {error ? (
            <p className="text-caption text-[var(--badge-high-text)]" role="alert">
              {error}
            </p>
          ) : null}

          <div>
            {subscribed ? (
              <Button
                type="button"
                variant="secondary"
                loading={busy}
                onClick={() => onAction(openBillingPortal)}
              >
                Manage billing
              </Button>
            ) : status && !status.billing_configured ? (
              // Stripe not wired yet — present a friendly "coming soon" state, never an error.
              <div className="flex flex-col gap-2">
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border-strong bg-surface-2 px-3.5 py-1.5 text-caption text-secondary">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                  Pro — coming soon
                </span>
                <p className="text-caption text-tertiary">
                  Unlimited generations are on the way. You&apos;ll be able to upgrade
                  right here — no need to do anything yet.
                </p>
              </div>
            ) : (
              <Button
                type="button"
                loading={busy}
                disabled={!status}
                onClick={() => onAction(startCheckout)}
              >
                Upgrade to Pro — $15/mo
              </Button>
            )}
          </div>
        </Card>
      </main>
    </>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <AccountInner />
    </Suspense>
  );
}
