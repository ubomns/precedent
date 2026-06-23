/**
 * Billing client helpers. Calls the Python billing routes with the Supabase bearer
 * token and redirects the browser to the Stripe-hosted Checkout / Portal URLs.
 */
import { apiHeaders, apiUrl } from "@/lib/api";

export type BillingStatus = {
  tier: "registered" | "subscribed";
  is_subscribed: boolean;
  free_limit: number;
  billing_configured: boolean;
};

export async function getBillingStatus(): Promise<BillingStatus> {
  const res = await fetch(apiUrl("/api/billing/status"), {
    headers: await apiHeaders(false),
  });
  if (!res.ok) throw new Error("Could not load billing status.");
  return res.json();
}

async function postForRedirect(path: string): Promise<void> {
  const res = await fetch(apiUrl(path), {
    method: "POST",
    headers: await apiHeaders(),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error?.message ?? "Billing request failed.");
  }
  const { url } = await res.json();
  if (url) window.location.href = url;
}

/** Start the Pro subscription checkout (redirects to Stripe Checkout). */
export function startCheckout(): Promise<void> {
  return postForRedirect("/api/billing/checkout");
}

/** Open the Stripe Customer Portal to manage/cancel (redirects to Stripe). */
export function openBillingPortal(): Promise<void> {
  return postForRedirect("/api/billing/portal");
}
