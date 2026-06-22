/**
 * Shared API helpers. The backend requires a Supabase access token as
 * `Authorization: Bearer <token>` on all /api/* routes (the old shared
 * NEXT_PUBLIC_API_SECRET_KEY is retired — it could never enforce anything).
 */
import { createClient } from "@/lib/supabase/client";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export async function getAccessToken(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export async function apiHeaders(contentType: boolean = true): Promise<HeadersInit> {
  const headers: Record<string, string> = {};
  if (contentType) {
    headers["Content-Type"] = "application/json";
  }
  const token = await getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}
