"use client";

import { useRef, useState, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface TransitionLayoutProps {
  children: ReactNode;
}

/**
 * Layout-level page transition wrapper.
 *
 * On route change the outgoing page fades out, then the new children are
 * swapped in and fade/slide into place. Any previous transition timeline is
 * killed before a new one is created. Reduced motion skips the animation and
 * renders the new route instantly.
 */
export function TransitionLayout({ children }: TransitionLayoutProps) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const childrenRef = useRef(children);
  const previousPathnameRef = useRef(pathname);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const [displayedChildren, setDisplayedChildren] = useState(children);

  // Keep the latest children accessible to the animation callback without
  // re-running the effect on every parent render.
  childrenRef.current = children;

  useEffect(() => {
    if (pathname === previousPathnameRef.current) return;

    tweenRef.current?.kill();

    if (prefersReducedMotion) {
      previousPathnameRef.current = pathname;
      setDisplayedChildren(childrenRef.current);
      return;
    }

    const container = containerRef.current;
    if (!container) {
      previousPathnameRef.current = pathname;
      setDisplayedChildren(childrenRef.current);
      return;
    }

    try {
      // Opacity-only crossfade — deliberately NO transform. A transform here would
      // create a containing block for descendant position:fixed elements (the nav),
      // making the "fixed" nav scroll with the page. Opacity does not.
      tweenRef.current = gsap.to(container, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          previousPathnameRef.current = pathname;
          setDisplayedChildren(childrenRef.current);
          tweenRef.current = gsap.fromTo(
            container,
            { opacity: 0 },
            { opacity: 1, duration: 0.4, ease: "power2.out" }
          );
        },
      });
    } catch {
      // GSAP failure should never block navigation.
      previousPathnameRef.current = pathname;
      setDisplayedChildren(childrenRef.current);
      gsap.set(container, { opacity: 1 });
    }
  }, [pathname, prefersReducedMotion]);

  return (
    <div ref={containerRef} className="w-full">
      {displayedChildren}
    </div>
  );
}
