import { Nav } from "@/components/design-system/nav";
import { Eyebrow, Heading1, BodyLarge } from "@/components/design-system";
import { AuthNavActions } from "@/components/auth/auth-nav-actions";
import IntakeWizard from "@/components/intake/intake-wizard";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Intake", href: "/intake" },
  { label: "Review", href: "/review" },
  { label: "Export", href: "/export" },
];

export default function IntakePage() {
  return (
    <div className="relative min-h-[100dvh] flex flex-col overflow-x-hidden">
      <div
        className="vignette absolute pointer-events-none"
        style={{
          width: 900,
          height: 900,
          top: "35%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      <Nav items={NAV_ITEMS} actions={<AuthNavActions />} />

      <main className="relative z-0 flex-1 flex flex-col items-center px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-20 sm:pb-24">
        <div className="w-full sm:max-w-[720px] sm:mx-auto mb-6 sm:mb-8">
          <Eyebrow>Business Requirements Document Generator</Eyebrow>
          <Heading1 className="mt-4">Start your BRD</Heading1>
          <BodyLarge className="mt-3 text-secondary max-w-[55ch]">
            Answer a few questions and Precedent structures the output into a
            12-section BRD.
          </BodyLarge>
        </div>

        <IntakeWizard />
      </main>

      <footer className="relative z-10 pb-6 pt-2 text-center text-sm text-tertiary">
        Precedent v1 · 2026
      </footer>
    </div>
  );
}
