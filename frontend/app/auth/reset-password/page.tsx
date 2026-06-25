"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, PasswordInput, FieldWrapper } from "@/components/design-system";
import { AuthCard } from "@/components/auth/auth-card";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/intake");
    router.refresh();
  };

  return (
    <AuthCard
      title="Set a new password"
      subtitle="Choose a strong password you don't use elsewhere."
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <FieldWrapper label="New password" htmlFor="password" hint="8+ characters" error={error}>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error}
          />
        </FieldWrapper>
        <Button type="submit" fullWidth loading={loading}>
          Update password
        </Button>
      </form>
    </AuthCard>
  );
}
