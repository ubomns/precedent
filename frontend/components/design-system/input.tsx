"use client";

import { forwardRef, useState, InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";
import { IconEye, IconEyeOff } from "@/components/icons";

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

/**
 * Password field with a show/hide toggle. Same look as Input but reserves room on
 * the right for an eye button. The toggle button is removed from the tab order
 * (tabIndex=-1) so keyboard flow goes input → submit, not input → eye → submit.
 */
export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(function PasswordInput(
  { className = "", error = false, type: _type, ...rest },
  ref
) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        ref={ref}
        type={show ? "text" : "password"}
        className={[
          "field w-full bg-surface-2 border rounded-xl pl-4 pr-12 py-3 text-base text-ink placeholder:text-tertiary",
          "focus:outline-none",
          error ? "border-[var(--badge-high-text)]" : "border-border",
          className,
        ].join(" ")}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        tabIndex={-1}
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-lg text-tertiary hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {show ? <IconEyeOff size={18} /> : <IconEye size={18} />}
      </button>
    </div>
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
