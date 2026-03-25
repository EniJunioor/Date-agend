"use client";

import { useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { resetPasswordAction } from "@/app/actions/auth";
import { AppIcon } from "@/components/ui/app-icon";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <AppIcon name="x" size={48} strokeWidth={2} style={{ color: "#dc2626" }} />
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--foreground)", marginBottom: 8 }}>
          Link inválido
        </h2>
        <p style={{ fontSize: 14, color: "var(--foreground-muted)", marginBottom: 20 }}>
          Este link é inválido ou expirou. Solicite um novo.
        </p>
        <Link href="/forgot-password" style={{ color: "var(--primary)", fontWeight: 600 }}>
          Solicitar novo link →
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <AppIcon name="check" size={52} strokeWidth={2} style={{ color: "var(--primary)" }} />
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "var(--foreground)", marginBottom: 8 }}>
          Senha redefinida!
        </h2>
        <p style={{ fontSize: 14, color: "var(--foreground-muted)", marginBottom: 24 }}>
          Sua senha foi alterada com sucesso. Faça login com a nova senha.
        </p>
        <Link href="/login" style={{
          display: "inline-flex", padding: "12px 24px",
          background: "var(--primary)", color: "white",
          borderRadius: "var(--radius-md)", fontSize: 14, fontWeight: 700,
          textDecoration: "none"
        }}>
          Entrar →
        </Link>
      </div>
    );
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    const password = formData.get("password") as string;
    const confirm = formData.get("confirm") as string;

    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 8) {
      setError("A senha deve ter ao menos 8 caracteres.");
      return;
    }

    startTransition(async () => {
      const result = await resetPasswordAction(token, password);
      if (result?.error) setError(result.error);
      else setSuccess(true);
    });
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "var(--foreground)", marginBottom: 6 }}>
          Redefinir senha
        </h2>
        <p style={{ fontSize: 14, color: "var(--foreground-muted)" }}>
          Digite e confirme sua nova senha.
        </p>
      </div>

      <form action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {error && (
          <div style={{ padding: "12px 16px", borderRadius: "var(--radius-md)", background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca", fontSize: 14 }}>
            {error}
          </div>
        )}

        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", display: "block", marginBottom: 6 }}>
            Nova senha
          </label>
          <input
            name="password" type="password" required minLength={8}
            placeholder="Mín. 8 caracteres"
            style={{ width: "100%", padding: "11px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: 14, outline: "none" }}
          />
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", display: "block", marginBottom: 6 }}>
            Confirmar nova senha
          </label>
          <input
            name="confirm" type="password" required
            placeholder="Repita a senha"
            style={{ width: "100%", padding: "11px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: 14, outline: "none" }}
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
          {isPending ? "Salvando..." : "Redefinir senha"}
        </button>
      </form>
    </div>
  );
}
