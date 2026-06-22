"use client";

import { ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";

/**
 * Register GSAP plugins exactly once at module load.
 * ScrollTrigger and Flip are globally available after this call.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, Flip);
}

interface GsapProviderProps {
  children: ReactNode;
}

/**
 * Provider wrapper that ensures GSAP plugins are registered.
 * Mount near the root of the app so plugins are available to all motion
 * components.
 */
export function GsapProvider({ children }: GsapProviderProps) {
  return <>{children}</>;
}
