"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/app/actions/auth";
import { AppIcon } from "@/components/ui/app-icon";

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setEmail(formData.get("email") as string);
    startTransition(async () => {
      const result = await forgotPasswordAction(formData);
      if (result?.error) setError(result.error);
      else setSent(true);
    });
  }

  if (sent) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <AppIcon name="mail" size={52} strokeWidth={1.5} style={{ color: "var(--primary)" }} />
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "var(--foreground)", marginBottom: 8 }}>
          E-mail enviado!
        </h2>
        <p style={{ fontSize: 14, color: "var(--foreground-muted)", lineHeight: 1.6, marginBottom: 24 }}>
          Se <strong>{email}</strong> está cadastrado, você receberá o link para redefinir a senha.
          Verifique também a caixa de spam.
        </p>
        <Link href="/login" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none", fontSize: 14 }}>
          ← Voltar ao login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "var(--foreground)", marginBottom: 6 }}>
          Esqueceu a senha?
        </h2>
        <p style={{ fontSize: 14, color: "var(--foreground-muted)" }}>
          Digite seu e-mail e enviaremos um link para você redefinir a senha.
        </p>
      </div>

      <form action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {error && (
          <div style={{ padding: "12px 16px", borderRadius: "var(--radius-md)", background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca", fontSize: 14 }}>
            {error}
          </div>
        )}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", display: "block", marginBottom: 6 }}>E-mail</label>
          <input
            name="email" type="email" required
            placeholder="voce@email.com"
            style={{
              width: "100%", padding: "11px 14px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              background: "var(--background)", color: "var(--foreground)",
              fontSize: 14, outline: "none"
            }}
          />
        </div>
        <button
          type="submit" disabled={isPending}
          style={{
            padding: 13, borderRadius: "var(--radius-md)",
            background: "var(--primary)", color: "white",
            border: "none", fontSize: 15, fontWeight: 700,
            cursor: isPending ? "not-allowed" : "pointer",
            opacity: isPending ? 0.7 : 1,
            boxShadow: "var(--shadow-primary)"
          }}
        >
          {isPending ? "Enviando..." : "Enviar link de redefinição"}
        </button>
        <Link href="/login" style={{ textAlign: "center", color: "var(--foreground-muted)", fontSize: 13, textDecoration: "none" }}>
          ← Voltar ao login
        </Link>
      </form>
    </div>
  );
}
