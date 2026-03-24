import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Entrar",
};


export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const sp = await searchParams;

  return (
    <>
      <h1 className="auth-split-page-title">Entre na sua conta</h1>
      <p className="auth-split-page-sub">
        Acesse para continuar guardando os momentos de vocês.
      </p>

      {sp.error === "email_not_verified" ? (
        <div className="auth-split-alert auth-split-alert--warn">
          Confirme seu e-mail antes de entrar.
        </div>
      ) : null}

      <LoginForm callbackUrl={sp.callbackUrl ?? "/dashboard"} />

      <p className="auth-split-footer">
        Ainda não tem conta?{" "}
        <Link href="/register">Criar conta grátis</Link>
      </p>
    </>
  );
}
