/**
 * Shared API helpers for the Precedent frontend.
 *
 * The backend requires `Authorization: Bearer <API_SECRET_KEY>` on all
 * `/api/*` routes. The key is read from NEXT_PUBLIC_API_SECRET_KEY.
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export const API_SECRET_KEY = process.env.NEXT_PUBLIC_API_SECRET_KEY ?? "";

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export function apiHeaders(contentType: boolean = true): HeadersInit {
  const headers: HeadersInit = {};
  if (contentType) {
    headers["Content-Type"] = "application/json";
  }
  if (API_SECRET_KEY) {
    headers["Authorization"] = `Bearer ${API_SECRET_KEY}`;
  }
  return headers;
}
