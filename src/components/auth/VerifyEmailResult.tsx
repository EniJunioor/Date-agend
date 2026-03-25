"use client";

import Link from "next/link";
import { AppIcon } from "@/components/ui/app-icon";

export function VerifyEmailResult({
  success,
  error,
}: {
  success: boolean;
  error?: string;
}) {
  return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        {success ? (
          <AppIcon name="check" size={56} strokeWidth={2} style={{ color: "var(--primary)" }} />
        ) : (
          <AppIcon name="x" size={56} strokeWidth={2} style={{ color: "#dc2626" }} />
        )}
      </div>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 24,
          fontWeight: 800,
          color: "var(--foreground)",
          marginBottom: 8,
        }}
      >
        {success ? "E-mail confirmado!" : "Ops, algo deu errado"}
      </h2>
      <p
        style={{
          fontSize: 14,
          color: "var(--foreground-muted)",
          lineHeight: 1.6,
          marginBottom: 28,
          maxWidth: 360,
          margin: "0 auto 28px",
        }}
      >
        {success
          ? "Sua conta está ativada. Agora é só entrar e começar a registrar as memórias de vocês."
          : error ?? "Link inválido ou expirado. Solicite um novo e-mail."}
      </p>
      <Link
        href={success ? "/login" : "/register"}
        style={{
          display: "inline-flex",
          padding: "12px 28px",
          background: "var(--primary)",
          color: "white",
          borderRadius: "var(--radius-md)",
          fontSize: 14,
          fontWeight: 700,
          textDecoration: "none",
          boxShadow: "var(--shadow-primary)",
        }}
      >
        {success ? "Entrar na conta →" : "Tentar novamente →"}
      </Link>
    </div>
  );
}
