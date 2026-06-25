"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button, Input, PasswordInput, FieldWrapper, Body } from "@/components/design-system";
import { AuthCard } from "@/components/auth/auth-card";
import { GoogleButton } from "@/components/auth/google-button";
import { createClient } from "@/lib/supabase/client";
import { sanitizeNext } from "@/lib/auth/next-param";

function SignupForm() {
  const next = sanitizeNext(useSearchParams().get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const fe: typeof fieldError = {};
    if (!email) fe.email = "Email is required.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) fe.email = "Enter a valid email.";
    if (!password) fe.password = "Password is required.";
    else if (password.length < 8) fe.password = "Use at least 8 characters.";
    setFieldError(fe);
    if (Object.keys(fe).length) return;

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
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
      <AuthCard title="Check your email" subtitle={`We sent a confirmation link to ${email}.`}>
        <Body className="text-secondary">
          Click the link in that email to verify your account, then log in to start generating.
        </Body>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Free to start — 10 BRDs included."
      footer={
        <>
          Already have an account?{" "}
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-accent">Log in</Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <FieldWrapper label="Email" htmlFor="email" error={fieldError.email}>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={!!fieldError.email} />
        </FieldWrapper>
        <FieldWrapper label="Password" htmlFor="password" hint="8+ characters" error={fieldError.password}>
          <PasswordInput id="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={!!fieldError.password} />
        </FieldWrapper>
        {error ? (
          <p className="text-caption text-[var(--badge-high-text)]" role="alert">{error}</p>
        ) : null}
        <Button type="submit" fullWidth loading={loading}>Create account</Button>
      </form>
      <div className="flex items-center gap-3 my-4">
        <span className="h-px flex-1 bg-border" />
        <span className="text-caption text-tertiary">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <GoogleButton next={next} />
    </AuthCard>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
