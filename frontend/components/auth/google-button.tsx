"use client";

import { GoogleIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";

export function GoogleButton({ next }: { next: string }) {
  const onClick = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          next
        )}`,
      },
    });
  };

  // Mirrors the design-system `secondary` Button tokens, but centers a leading
  // brand mark (Google's guidelines place the logo left of the label) rather than
  // the design system's trailing nested-icon well.
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-full min-h-[44px] select-none items-center justify-center gap-3 rounded-lg border border-border-strong bg-transparent px-5 py-2 text-sm font-medium tracking-tight text-ink transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ground"
    >
      <GoogleIcon size={18} />
      Continue with Google
    </button>
  );
}
