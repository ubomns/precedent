"use client";

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

interface FieldWrapperProps {
  label?: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function FieldWrapper({
  label,
  htmlFor,
  hint,
  error,
  children,
  className = "",
}: FieldWrapperProps) {
  return (
    <div className={className}>
      {label ? (
        <div className="flex items-baseline justify-between mb-2">
          <label
            htmlFor={htmlFor}
            className="text-caption uppercase tracking-[0.1em] text-secondary font-medium"
          >
            {label}
          </label>
          {hint ? (
            <span className="text-mono text-tertiary font-mono">{hint}</span>
          ) : null}
        </div>
      ) : null}
      {children}
      {error ? (
        <p className="mt-2 text-caption text-[var(--badge-high-text)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = "", error = false, ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      className={[
        "field w-full bg-surface-2 border rounded-xl px-4 py-3 text-base text-ink placeholder:text-tertiary",
        "focus:outline-none",
        error
          ? "border-[var(--badge-high-text)]"
          : "border-border",
        className,
      ].join(" ")}
      {...rest}
    />
  );
});

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { className = "", error = false, rows = 4, ...rest },
  ref
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={[
        "field w-full bg-surface-2 border rounded-xl px-4 py-3 text-base text-ink placeholder:text-tertiary leading-relaxed resize-none",
        "focus:outline-none",
        error
          ? "border-[var(--badge-high-text)]"
          : "border-border",
        className,
      ].join(" ")}
      {...rest}
    />
  );
});
