// Minimal stroke-icon set for Precedent.
// All icons are 1.5px stroke, currentColor, sized via className (default 16).

const Icon = ({ size = 16, children, className = '', strokeWidth = 1.5, ...rest }) => (
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
  >{children}</svg>
);

const IconArrow = (p) => (
  <Icon {...p}><path d="M5 12h14M13 6l6 6-6 6"/></Icon>
);
const IconArrowDiag = (p) => (
  <Icon {...p}><path d="M7 17 17 7M10 7h7v7"/></Icon>
);
const IconPlus = (p) => (
  <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>
);
const IconDownload = (p) => (
  <Icon {...p}><path d="M12 4v12M7 11l5 5 5-5M5 20h14"/></Icon>
);
const IconShield = (p) => (
  <Icon {...p}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/></Icon>
);
const IconCheck = (p) => (
  <Icon {...p}><path d="m5 12 4 4 10-10"/></Icon>
);
const IconChevron = (p) => (
  <Icon {...p}><path d="m9 6 6 6-6 6"/></Icon>
);
const IconChevronDown = (p) => (
  <Icon {...p}><path d="m6 9 6 6 6-6"/></Icon>
);
const IconX = (p) => (
  <Icon {...p}><path d="M6 6l12 12M18 6 6 18"/></Icon>
);
const IconSparkle = (p) => (
  <Icon {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></Icon>
);
const IconDoc = (p) => (
  <Icon {...p}><path d="M7 3h7l4 4v14H7zM14 3v4h4"/><path d="M10 13h6M10 17h4"/></Icon>
);
const IconCircleDot = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"/></Icon>
);
const IconLink = (p) => (
  <Icon {...p}><path d="M10 14a4 4 0 0 0 5.6 0l3-3a4 4 0 0 0-5.6-5.6L11.5 7"/><path d="M14 10a4 4 0 0 0-5.6 0l-3 3a4 4 0 0 0 5.6 5.6L12.5 17"/></Icon>
);
const IconUsers = (p) => (
  <Icon {...p}><circle cx="9" cy="9" r="3"/><path d="M3 19c1-3.5 3.5-5 6-5s5 1.5 6 5"/><circle cx="17" cy="8" r="2.5"/><path d="M15 14c2 .3 4 1.8 5 5"/></Icon>
);

Object.assign(window, {
  IconArrow, IconArrowDiag, IconPlus, IconDownload, IconShield,
  IconCheck, IconChevron, IconChevronDown, IconX, IconSparkle,
  IconDoc, IconCircleDot, IconLink, IconUsers,
});
