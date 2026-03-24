import type { Metadata } from "next";
import { verifyEmailAction } from "@/app/actions/auth";
import Link from "next/link";

export const metadata: Metadata = { title: "Verificar E-mail" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const { token } = searchParams;

  if (!token) {
    return <VerifyResult success={false} error="Link inválido. Solicite um novo e-mail de verificação." />;
  }

  const result = await verifyEmailAction(token);

  return <VerifyResult success={!!result.success} error={result.error} />;
}

function VerifyResult({ success, error }: { success: boolean; error?: string }) {
  return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>
        {success ? "✅" : "❌"}
      </div>
      <h2 style={{
        fontFamily: "var(--font-display)",
        fontSize: 24, fontWeight: 800,
        color: "var(--foreground)", marginBottom: 8
      }}>
        {success ? "E-mail confirmado!" : "Ops, algo deu errado"}
      </h2>
      <p style={{ fontSize: 14, color: "var(--foreground-muted)", lineHeight: 1.6, marginBottom: 28, maxWidth: 360, margin: "0 auto 28px" }}>
        {success
          ? "Sua conta está ativada. Agora é só entrar e começar a registrar as memórias de vocês! ❤️"
          : error ?? "Link inválido ou expirado. Solicite um novo e-mail."}
      </p>
      <Link
        href={success ? "/login" : "/register"}
        style={{
          display: "inline-flex", padding: "12px 28px",
          background: "var(--primary)", color: "white",
          borderRadius: "var(--radius-md)", fontSize: 14, fontWeight: 700,
          textDecoration: "none", boxShadow: "var(--shadow-primary)"
        }}
      >
        {success ? "Entrar na conta →" : "Tentar novamente →"}
      </Link>
    </div>
  );
}
