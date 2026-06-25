"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input, PasswordInput, FieldWrapper } from "@/components/design-system";
import { AuthCard } from "@/components/auth/auth-card";
import { GoogleButton } from "@/components/auth/google-button";
import { createClient } from "@/lib/supabase/client";
import { sanitizeNext } from "@/lib/auth/next-param";

function LoginForm() {
  const router = useRouter();
  const next = sanitizeNext(useSearchParams().get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const fe: typeof fieldError = {};
    if (!email) fe.email = "Email is required.";
    if (!password) fe.password = "Password is required.";
    setFieldError(fe);
    if (Object.keys(fe).length) return;

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(next);
    router.refresh();
  };

  return (
    <AuthCard
      title="Log in"
      subtitle="Welcome back."
      footer={
        <>
          New here?{" "}
          <Link href={`/signup?next=${encodeURIComponent(next)}`} className="text-accent">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <FieldWrapper label="Email" htmlFor="email" error={fieldError.email}>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={!!fieldError.email} />
        </FieldWrapper>
        <FieldWrapper label="Password" htmlFor="password" error={fieldError.password}>
          <PasswordInput id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={!!fieldError.password} />
        </FieldWrapper>
        {error ? (
          <p className="text-caption text-[var(--badge-high-text)]" role="alert">{error}</p>
        ) : null}
        <Button type="submit" fullWidth loading={loading}>Log in</Button>
      </form>
      <div className="flex items-center gap-3 my-4">
        <span className="h-px flex-1 bg-border" />
        <span className="text-caption text-tertiary">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <GoogleButton next={next} />
      <Link href="/forgot-password" className="mt-4 block text-caption text-tertiary hover:text-ink text-center">
        Forgot your password?
      </Link>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
