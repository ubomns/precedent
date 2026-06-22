"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AuthNavActions() {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) return null;

  if (!email) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(pathname)}`}
        className="px-3 py-2 text-sm tracking-tight text-secondary hover:text-ink transition-colors rounded-md"
      >
        Sign in
      </Link>
    );
  }

  const onLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex items-center gap-3">
      <span className="hidden sm:inline text-caption text-tertiary font-mono max-w-[18ch] truncate">
        {email}
      </span>
      <button
        type="button"
        onClick={onLogout}
        className="px-3 py-2 text-sm tracking-tight text-secondary hover:text-ink transition-colors rounded-md"
      >
        Log out
      </button>
    </div>
  );
}
