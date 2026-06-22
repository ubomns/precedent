"use client";

/**
 * Static fallback for the Three.js hero.
 *
 * Rendered when WebGL context creation fails (or while the dynamic Three.js
 * chunk is loading). Uses the design-system vignette token plus a slow emerald
 * radial pulse so the hero keeps the approved ambient wash.
 *
 * The pulse is intentionally not tied to prefers-reduced-motion: it is a
 * static background wash, not motion that carries information or risks
 * vestibular triggers.
 */
export function HeroFallback() {
  return (
    <>
      <div
        aria-hidden="true"
        className="vignette pointer-events-none absolute inset-0 -z-10"
      />
      <div
        aria-hidden="true"
        className="hero-fallback-pulse pointer-events-none absolute inset-0 -z-10 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 50% 20%, rgba(16,185,129,0.10), transparent 55%)",
        }}
      />
    </>
  );
}
