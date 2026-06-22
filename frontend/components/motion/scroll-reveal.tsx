"use client";

import { useRef, ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  as?: "section" | "div";
}

/**
 * Scroll-triggered reveal wrapper.
 *
 * Children that should animate should carry `data-reveal`. The wrapper batches
 * them into one ScrollTrigger per section and staggers their entrance.
 *
 * Reduced motion: elements are set to final visible state instantly.
 */
export function ScrollReveal({
  children,
  className = "",
  as = "section",
}: ScrollRevealProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const items = section.querySelectorAll("[data-reveal]");
      if (items.length === 0) return;

      if (prefersReducedMotion) {
        gsap.set(items, { opacity: 1, y: 0 });
        return;
      }

      gsap.set(items, { opacity: 0, y: 32 });

      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power2.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion] }
  );

  if (as === "div") {
    return (
      <div ref={sectionRef as React.RefObject<HTMLDivElement>} className={className}>
        {children}
      </div>
    );
  }

  return (
    <section ref={sectionRef} className={className}>
      {children}
    </section>
  );
}
