"use client";

import { ReactNode, HTMLAttributes } from "react";

type HeadingLevel = "h1" | "h2" | "h3";

interface TypographyProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: HeadingLevel | "p" | "span";
  className?: string;
}

export function Eyebrow({ children, className = "", ...rest }: TypographyProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-eyebrow uppercase tracking-[0.18em] text-secondary ring-1 ring-white/10 bg-white/[0.025]",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </span>
  );
}

export function Display({ children, className = "", ...rest }: TypographyProps) {
  return (
    <h1
      className={[
        "text-display md:text-[4rem] font-semibold leading-[1.05] tracking-[-0.03em] text-ink",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </h1>
  );
}

export function Heading1({ children, className = "", ...rest }: TypographyProps) {
  return (
    <h1
      className={[
        "text-h1 md:text-[2.5rem] font-semibold leading-[1.1] tracking-[-0.02em] text-ink",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </h1>
  );
}

export function Heading2({ children, className = "", ...rest }: TypographyProps) {
  return (
    <h2
      className={[
        "text-h2 md:text-[2rem] font-semibold leading-[1.15] tracking-[-0.015em] text-ink",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </h2>
  );
}

export function Heading3({ children, className = "", ...rest }: TypographyProps) {
  return (
    <h3
      className={[
        "text-h3 md:text-2xl font-medium leading-[1.25] tracking-[-0.01em] text-ink",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </h3>
  );
}

export function Body({
  children,
  className = "",
  as: Component = "p",
  ...rest
}: TypographyProps) {
  return (
    <Component
      className={[
        "text-body leading-relaxed max-w-[65ch]",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </Component>
  );
}

export function BodyLarge({
  children,
  className = "",
  as: Component = "p",
  ...rest
}: TypographyProps) {
  return (
    <Component
      className={[
        "text-body-lg leading-relaxed text-body max-w-[65ch]",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </Component>
  );
}

export function BodySmall({
  children,
  className = "",
  as: Component = "p",
  ...rest
}: TypographyProps) {
  return (
    <Component
      className={[
        "text-body-sm leading-relaxed text-secondary max-w-[65ch]",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </Component>
  );
}

export function Caption({
  children,
  className = "",
  as: Component = "span",
  ...rest
}: TypographyProps) {
  return (
    <Component
      className={[
        "text-caption leading-[1.4] tracking-[0.02em] text-secondary",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </Component>
  );
}

export function Mono({
  children,
  className = "",
  as: Component = "span",
  ...rest
}: TypographyProps) {
  return (
    <Component
      className={["font-mono text-mono text-secondary", className].join(" ")}
      {...rest}
    >
      {children}
    </Component>
  );
}
