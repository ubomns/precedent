"use client";

import { useState } from "react";
import { Button, Input, FieldWrapper, Body } from "@/components/design-system";
import { AuthCard } from "@/components/auth/auth-card";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Email is required.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <AuthCard
        title="Check your email"
        subtitle={`If an account exists for ${email}, a reset link is on its way.`}
      >
        <Body className="text-secondary">Open the link to set a new password.</Body>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Reset your password" subtitle="We'll email you a secure link.">
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <FieldWrapper label="Email" htmlFor="email" error={error}>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!error}
          />
        </FieldWrapper>
        <Button type="submit" fullWidth loading={loading}>
          Send reset link
        </Button>
      </form>
    </AuthCard>
  );
}
