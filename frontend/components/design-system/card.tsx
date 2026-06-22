"use client";

import { ReactNode, forwardRef, HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  tone?: "default" | "elevated";
}

const paddingStyles = {
  none: "",
  sm: "p-4 md:p-5",
  md: "p-6 md:p-8",
  lg: "p-8 md:p-10",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    children,
    padding = "md",
    tone = "default",
    className = "",
    ...rest
  },
  ref
) {
  return (
    <div
      ref={ref}
      className={[
        "surface-card",
        tone === "elevated" ? "bg-surface-2" : "bg-surface",
        paddingStyles[padding],
        "transition-colors duration-200",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
});
