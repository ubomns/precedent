import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { GsapProvider } from "@/components/motion/gsap-provider";
import { TransitionLayout } from "@/components/motion/transition-layout";

export const metadata: Metadata = {
  title: "Precedent — BRD Generator",
  description:
    "Turn a structured project brief into a near-complete Business Requirements Document.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
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
        <Script src="/theme.js" strategy="beforeInteractive" />
        <GsapProvider>
          <TransitionLayout>{children}</TransitionLayout>
        </GsapProvider>
      </body>
    </html>
  );
}
