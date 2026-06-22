"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoIcon, IconX } from "@/components/icons";

interface NavItem {
  label: string;
  href: string;
  disabled?: boolean;
}

interface NavProps {
  items: NavItem[];
  actions?: ReactNode;
  brand?: ReactNode;
}

function MenuIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function Nav({ items, actions, brand }: NavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-ground/90 backdrop-blur-xl">
        <nav
          className={[
            "flex items-center justify-between gap-4 px-4 md:px-6 py-3 md:py-4",
            "max-w-[1400px] mx-auto",
          ].join(" ")}
          aria-label="Primary"
        >
          <Link
            href="/"
            className="flex items-center gap-2.5 py-1"
          >
            {brand || (
              <>
                <LogoIcon size={18} />
                <span className="text-sm font-medium tracking-tight text-ink">
                  Precedent
                </span>
              </>
            )}
          </Link>

          <div className="flex items-center gap-1 md:gap-2">
            {items.map((item) => {
              const active = isActive(item.href) && !item.disabled;
              return (
                <Link
                  key={item.href}
                  href={item.disabled ? "#" : item.href}
                  onClick={(e) => item.disabled && e.preventDefault()}
                  aria-disabled={item.disabled}
                  className={[
                    "relative px-3 py-2 text-sm tracking-tight transition-colors rounded-md",
                    active
                      ? "text-ink font-medium"
                      : "text-secondary hover:text-ink hover:bg-white/[0.04]",
                    item.disabled
                      ? "opacity-40 cursor-not-allowed hover:text-secondary hover:bg-transparent"
                      : "",
                  ].join(" ")}
                >
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-accent rounded-full" />
                  )}
                </Link>
              );
            })}

            {actions ? (
              <div className="hidden md:flex items-center ml-2 pl-2 border-l border-white/[0.08]">
                {actions}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-md text-ink hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              <MenuIcon />
            </button>
          </div>
        </nav>
      </header>

      {open ? (
        <div
          id="mobile-menu"
          className="fixed inset-0 z-[60] bg-ground/95 backdrop-blur-xl md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col h-full px-6 py-6">
            <div className="flex items-center justify-between mb-12">
              <Link
                href="/"
                className="flex items-center gap-2.5"
                onClick={() => setOpen(false)}
              >
                <LogoIcon size={20} />
                <span className="text-lg font-medium tracking-tight text-ink">
                  Precedent
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center w-11 h-11 rounded-lg text-ink hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Close menu"
              >
                <IconX size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {items.map((item) => {
                const active = isActive(item.href) && !item.disabled;
                return (
                  <Link
                    key={item.href}
                    href={item.disabled ? "#" : item.href}
                    onClick={() => !item.disabled && setOpen(false)}
                    aria-disabled={item.disabled}
                    className={[
                      "flex items-center gap-4 px-4 py-4 rounded-lg text-h1 tracking-tight transition-colors border-l-2",
                      active
                        ? "text-ink bg-surface-2 border-accent"
                        : "text-ink hover:bg-surface-2 border-transparent",
                      item.disabled ? "opacity-40 cursor-not-allowed" : "",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {actions ? (
              <div className="mt-auto pt-6 border-t border-white/10">{actions}</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
