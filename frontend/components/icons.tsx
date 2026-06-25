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

// Google "G" — official 4-color brand mark. Standalone (not the stroke `Icon`
// wrapper) because the logo uses fixed brand fills, not currentColor strokes.
export function GoogleIcon({ size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M23.04 12.261c0-.815-.073-1.6-.21-2.353H12v4.451h6.19c-.267 1.44-1.078 2.66-2.296 3.476v2.888h3.717c2.174-2.003 3.43-4.953 3.43-8.462z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.105 0 5.71-1.03 7.613-2.787l-3.717-2.888c-1.03.69-2.347 1.098-3.896 1.098-2.996 0-5.532-2.024-6.437-4.744H1.74v2.982C3.632 21.43 7.51 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.563 14.679A7.207 7.207 0 0 1 5.18 12c0-.93.16-1.832.382-2.679V6.34H1.74A11.997 11.997 0 0 0 .48 12c0 1.936.464 3.768 1.26 5.66l3.823-2.981z"
      />
      <path
        fill="#EA4335"
        d="M12 4.756c1.69 0 3.205.581 4.396 1.72l3.299-3.299C17.706 1.245 15.101 0 12 0 7.51 0 3.632 2.57 1.74 6.34l3.823 2.981C6.468 6.601 9.004 4.756 12 4.756z"
      />
    </svg>
  );
}

export function IconEye({ size, className, strokeWidth }: IconProps) {
  return (
    <Icon size={size} className={className} strokeWidth={strokeWidth}>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  );
}

export function IconEyeOff({ size, className, strokeWidth }: IconProps) {
  return (
    <Icon size={size} className={className} strokeWidth={strokeWidth}>
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a3 3 0 0 0 4.24 4.24" />
      <path d="M9.4 5.2A9.8 9.8 0 0 1 12 5c6.4 0 10 7 10 7a16.9 16.9 0 0 1-2.55 3.4M6.2 6.2A16.5 16.5 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 3.6-.68" />
    </Icon>
  );
}

export function LogoIcon({ size = 20, className }: IconProps) {
  // Precedent mark: a structured document (front sheet + rules = the 12-section BRD)
  // stacked on a prior record behind it (precedent). Emerald on a transparent ground
  // for the nav; the favicon (app/icon.svg) wraps it in a dark tile for tab contrast.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* sheet stacked behind (prior record) */}
      <path
        d="M11.5 4.75h10A3 3 0 0 1 24.5 7.75V18"
        stroke="#10B981"
        strokeOpacity="0.4"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* front sheet */}
      <rect x="6" y="7.5" width="16" height="19" rx="3" stroke="#10B981" strokeWidth="2.4" />
      {/* structured rules */}
      <rect x="9.5" y="14" width="10" height="2.4" rx="1.2" fill="#10B981" />
      <rect x="9.5" y="19" width="6.8" height="2.4" rx="1.2" fill="#10B981" fillOpacity="0.6" />
    </svg>
  );
}
