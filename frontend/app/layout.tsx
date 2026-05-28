import type { Metadata } from "next";
import "./globals.css";

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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem("theme");
                  if (theme === "light") {
                    document.documentElement.classList.remove("dark");
                    document.documentElement.classList.add("light");
                  } else {
                    document.documentElement.classList.add("dark");
                    document.documentElement.classList.remove("light");
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-[100dvh] bg-ground text-ink">{children}</body>
    </html>
  );
}
