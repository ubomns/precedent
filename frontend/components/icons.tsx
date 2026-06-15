"use client";

// Minimal stroke-icon set for Precedent.
// All icons are 1.5px stroke, currentColor, sized via className (default 16).

interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

function Icon({ size = 16, children, className = "", strokeWidth = 1.5, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function IconArrow({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Icon>
  );
}

export function IconArrowDiag({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="M7 17 17 7M10 7h7v7" />
    </Icon>
  );
}

export function IconPlus({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function IconDownload({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="M12 4v12M7 11l5 5 5-5M5 20h14" />
    </Icon>
  );
}

export function IconShield({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </Icon>
  );
}

export function IconCheck({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="m5 12 4 4 10-10" />
    </Icon>
  );
}

export function IconChevron({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="m9 6 6 6-6 6" />
    </Icon>
  );
}

export function IconChevronDown({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  );
}

export function IconX({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Icon>
  );
}

export function IconSparkle({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
    </Icon>
  );
}

export function IconDoc({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="M7 3h7l4 4v14H7zM14 3v4h4" />
      <path d="M10 13h6M10 17h4" />
    </Icon>
  );
}

export function IconCircleDot({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function IconHome({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </Icon>
  );
}

export function IconArrowLeft({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </Icon>
  );
}

export function IconArrowRight({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </Icon>
  );
}

export function IconBank({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="M3 21h18M4 18h16M6 18v-8M10 18v-8M14 18v-8M18 18v-8M2 10l10-7 10 7" />
    </Icon>
  );
}

export function IconShieldCheck({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </Icon>
  );
}

export function IconHeartbeat({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="M19.5 13.572 12 21l-7.5-7.428A5 5 0 1 1 12 7.006a5 5 0 1 1 7.5 6.572" />
      <path d="M12 13V7M8 11h8" />
    </Icon>
  );
}

export function IconBuilding({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-6h2v6M13 21v-6h2v6" />
    </Icon>
  );
}

export function IconServer({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <rect x="2" y="3" width="20" height="6" rx="2" />
      <rect x="2" y="12" width="20" height="6" rx="2" />
      <path d="M6 6h.01M6 15h.01" />
    </Icon>
  );
}

export function LogoIcon({ size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="7" fill="#10B981" />
      <rect x="9" y="6" width="3" height="20" rx="1.5" fill="#050505" />
      <rect x="9" y="6" width="13" height="3" rx="1.5" fill="#050505" />
      <rect x="19" y="6" width="3" height="10" rx="1.5" fill="#050505" />
      <rect x="9" y="13" width="10" height="3" rx="1.5" fill="#050505" />
    </svg>
  );
}
