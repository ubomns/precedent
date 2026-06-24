"use client";

import { useEffect, useRef, useState } from "react";
import { HeroFallback } from "./fallback";
import type { CreateHeroSceneOptions } from "./scene";

export interface HeroSceneProps {
  /** Max device pixel ratio. 1 for mobile, 2 for desktop. */
  dpr?: number;
  /** Max particles. Design spec caps this at 200. */
  maxParticles?: number;
}

function hasWebGL(): boolean {
  if (typeof document === "undefined") return false;
  const canvas = document.createElement("canvas");
  return !!(
    canvas.getContext("webgl2") ||
    canvas.getContext("webgl") ||
    (window as unknown as { WebGLRenderingContext?: unknown }).WebGLRenderingContext
  );
}

/**
 * React wrapper for the Three.js hero scene.
 *
 * Responsibilities:
 * - fallback on WebGL failure only (reduced motion is intentionally not gated
 *   per product decision; the hero is decorative ambient motion)
 * - DPR cap passed through to the renderer
 * - IntersectionObserver pause when off-screen
 * - visibilitychange pause when tab is hidden
 * - dispose everything on unmount
 */
export default function HeroScene({ dpr = 2, maxParticles = 200 }: HeroSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<{
    dispose: () => void;
    pause: () => void;
    resume: () => void;
  } | null>(null);

  const [useFallback, setUseFallback] = useState(
    () => typeof window !== "undefined" && !hasWebGL()
  );

  useEffect(() => {
    if (useFallback) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    import("./scene")
      .then(({ createHeroScene }) => {
        if (cancelled) return;

        const opts: CreateHeroSceneOptions = {
          dpr,
          maxParticles,
        };

        try {
          sceneRef.current = createHeroScene(canvas, opts);
        } catch {
          setUseFallback(true);
          return;
        }

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                sceneRef.current?.resume();
              } else {
                sceneRef.current?.pause();
              }
            });
          },
          { threshold: 0 }
        );

        observer.observe(container);

        const handleVisibility = () => {
          if (document.hidden) {
            sceneRef.current?.pause();
          } else {
            sceneRef.current?.resume();
          }
        };

        document.addEventListener("visibilitychange", handleVisibility);

        cleanup = () => {
          observer.disconnect();
          document.removeEventListener("visibilitychange", handleVisibility);
        };
      })
      .catch(() => {
        setUseFallback(true);
      });

    return () => {
      cancelled = true;
      cleanup?.();
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [dpr, maxParticles, useFallback]);

  if (useFallback) {
    return <HeroFallback />;
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 -z-10 overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        role="img"
        aria-label="Animated outline of a Business Requirements Document assembling section by section"
      />
    </div>
  );
}
