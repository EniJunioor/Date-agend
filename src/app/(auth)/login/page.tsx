import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const sp = await searchParams;

  return (
    <>
      <div className="auth-modern-brand">Amore Moderno</div>
      <h1 className="auth-modern-title">Welcome back, Love.</h1>
      <p className="auth-modern-subtitle">
        Enter your details to continue documenting your journey together.
      </p>

      {sp.error === "email_not_verified" ? (
        <div className="auth-modern-alert auth-modern-alert--warn">
          Confirme seu e-mail antes de entrar.
        </div>
      ) : null}

      <LoginForm callbackUrl={sp.callbackUrl ?? "/dashboard"} />

      <p className="auth-modern-footer">
        Don’t have a shared account? <Link href="/register">Create one now</Link>
      </p>
    </>
  );
}

