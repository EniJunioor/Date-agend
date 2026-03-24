import Link from "next/link";
import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Criar conta" };

export default function RegisterPage() {
  return (
    <>
      <h1 className="auth-split-page-title">Crie sua conta</h1>
      <p className="auth-split-page-sub">
        Comece a guardar os momentos de vocês.
      </p>

      <RegisterForm />

      <p className="auth-split-footer">
        Já tem uma conta? <Link href="/login">Entrar</Link>
      </p>
    </>
  );
}
