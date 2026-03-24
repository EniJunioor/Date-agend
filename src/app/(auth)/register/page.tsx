import Link from "next/link";
import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Criar conta" };

export default function RegisterPage() {
  return (
    <div className="auth-form-container">
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--foreground)", marginBottom: 6 }}>
          Crie sua conta ❤️
        </h2>
        <p style={{ fontSize: 14, color: "var(--foreground-muted)" }}>
          Comece a registrar os momentos especiais de vocês
        </p>
      </div>

      <RegisterForm />

      <div style={{ marginTop: 28, textAlign: "center", fontSize: 14, color: "var(--foreground-muted)" }}>
        Já tem uma conta?{" "}
        <Link href="/login" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
          Entrar
        </Link>
      </div>
    </div>
  );
}
