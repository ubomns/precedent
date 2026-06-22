"use client";

import { Button } from "@/components/design-system";
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

  return (
    <Button variant="secondary" fullWidth onClick={onClick} type="button">
      Continue with Google
    </Button>
  );
}
