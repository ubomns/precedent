import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { GsapProvider } from "@/components/motion/gsap-provider";
import { TransitionLayout } from "@/components/motion/transition-layout";

export const metadata: Metadata = {
  title: "Precedent — BRD Generator",
  description:
    "Turn a structured project brief into a near-complete Business Requirements Document.",
};

// No-flash theme script. Inlined (rather than loaded via next/script) so it runs during
// <head> parse before first paint, and — crucially — so it's a plain host <script> element:
// React applies the CSP nonce via the property and skips it during hydration, whereas
// next/script's injection triggers a nonce attribute mismatch once the browser clears the
// nonce from the DOM. Keep this in sync with the theme toggle's class logic.
const THEME_SCRIPT = `(function(){try{var stored=localStorage.getItem("theme");var prefersLight=window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches;var theme=stored||(prefersLight?"light":"dark");var el=document.documentElement;if(theme==="light"){el.classList.remove("dark");el.classList.add("light");}else{el.classList.add("dark");el.classList.remove("light");}}catch(e){}})();`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Per-request nonce set by middleware; used to authorize our inline/early scripts
  // under the strict (nonce-based) CSP.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-[100dvh] bg-ground text-ink">
        <GsapProvider>
          <TransitionLayout>{children}</TransitionLayout>
        </GsapProvider>
      </body>
    </html>
  );
}
