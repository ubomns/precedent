"use client";

import { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes, forwardRef } from "react";
import Link from "next/link";
import { IconArrowDiag } from "@/components/icons";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface SharedButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}

interface ButtonAsButtonProps
  extends SharedButtonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "href"> {
  href?: undefined;
}

interface ButtonAsAnchorProps
  extends SharedButtonProps,
    AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

type ButtonProps = ButtonAsButtonProps | ButtonAsAnchorProps;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-ground hover:bg-accent-hover focus-visible:ring-accent",
  secondary:
    "bg-transparent border border-border-strong text-ink hover:bg-surface-2 focus-visible:ring-accent",
  ghost:
    "bg-transparent border border-border-strong text-ink hover:bg-surface-2 focus-visible:ring-accent",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "pl-4 pr-1 py-1 text-sm gap-2 min-h-[40px]",
  md: "pl-5 pr-1.5 py-2 text-sm gap-3 min-h-[44px] md:pl-6 md:py-2.5",
  lg: "pl-6 pr-2 py-2.5 text-base gap-3 min-h-[48px] md:pl-7 md:py-3",
};

const iconWellSize: Record<ButtonSize, string> = {
  sm: "w-7 h-7",
  md: "w-8 h-8",
  lg: "w-9 h-9",
};

function buttonClasses(
  variant: ButtonVariant,
  size: ButtonSize,
  fullWidth: boolean,
  className: string,
  isDisabled: boolean
) {
  return [
    "cta group relative inline-flex items-center justify-center font-medium tracking-tight rounded-lg select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ground",
    isDisabled ? "opacity-40 cursor-not-allowed" : "",
    variantStyles[variant],
    sizeStyles[size],
    fullWidth ? "w-full justify-between" : "",
    className,
  ].join(" ");
}

function ButtonContent({
  children,
  size,
  loading,
  trailingIcon,
  wellBg,
}: {
  children: ReactNode;
  size: ButtonSize;
  loading: boolean;
  trailingIcon?: ReactNode;
  wellBg: string;
}) {
  return (
    <>
      <span className="pl-0.5">{children}</span>
      <span
        className={[
          "cta-icon flex items-center justify-center rounded-md shrink-0",
          wellBg,
          iconWellSize[size],
        ].join(" ")}
      >
        {loading ? (
          <span
            className="block w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"
            aria-hidden="true"
          />
        ) : (
          trailingIcon || <IconArrowDiag size={size === "lg" ? 16 : 14} />
        )}
      </span>
    </>
  );
}

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(props, ref) {
    const {
      children,
      variant = "primary",
      size = "md",
      trailingIcon,
      fullWidth = false,
      loading = false,
      className = "",
    } = props;

    const isDisabled =
      ("disabled" in props && props.disabled) || loading;
    const wellBg = variant === "primary" ? "bg-white/15" : "bg-overlay-strong";

    if ("href" in props && props.href) {
      const {
        href,
        variant: _variant,
        size: _size,
        trailingIcon: _trailingIcon,
        fullWidth: _fullWidth,
        loading: _loading,
        className: _className,
        ...anchorProps
      } = props;

      return (
        <Link
          href={href}
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={buttonClasses(
            variant,
            size,
            fullWidth,
            className,
            isDisabled
          )}
          aria-disabled={isDisabled}
          {...anchorProps}
        >
          <ButtonContent size={size} loading={loading} trailingIcon={trailingIcon} wellBg={wellBg}>
            {children}
          </ButtonContent>
        </Link>
      );
    }

    const {
      type = "button",
      disabled = false,
      variant: _variant,
      size: _size,
      trailingIcon: _trailingIcon,
      fullWidth: _fullWidth,
      loading: _loading,
      className: _className,
      ...buttonProps
    } = props as ButtonAsButtonProps;

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        disabled={disabled || loading}
        className={buttonClasses(variant, size, fullWidth, className, disabled || loading)}
        {...buttonProps}
      >
        <ButtonContent size={size} loading={loading} trailingIcon={trailingIcon} wellBg={wellBg}>
          {children}
        </ButtonContent>
      </button>
    );
  }
);
