/**
 * Guard against open redirects. Only same-origin, relative paths are honored;
 * anything else falls back to /intake.
 */
export function sanitizeNext(next: string | null | undefined): string {
  if (!next) return "/intake";
  if (!next.startsWith("/")) return "/intake";
  if (next.startsWith("//")) return "/intake";
  if (next.includes("\\")) return "/intake";
  return next;
}
