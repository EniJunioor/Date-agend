import Link from "next/link";
import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Criar conta" };

export default function RegisterPage() {
  return (
    <>
      <div className="auth-modern-brand">Amore Moderno</div>
      <h1 className="auth-modern-title">Start your shared story today.</h1>
      <p className="auth-modern-subtitle">
        Create an account to preserve your most beautiful memories.
      </p>

      <RegisterForm />

      <p className="auth-modern-footer">
        Already have a shared account? <Link href="/login">Log in here</Link>
      </p>
    </>
  );
}

