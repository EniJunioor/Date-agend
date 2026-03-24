import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; callbackUrl?: string };
}) {
  return (
    <div className="auth-form-container">
      <div className="auth-form-header">
        <h2 className="auth-form-title">Bem-vindo de volta ❤️</h2>
        <p className="auth-form-subtitle">Entre na sua conta para continuar</p>
      </div>

      {searchParams.error === "email_not_verified" && (
        <div className="alert alert-warning">
          Confirme seu e-mail antes de entrar.
        </div>
      )}

      <LoginForm callbackUrl={searchParams.callbackUrl} />

      <div className="auth-form-footer">
        <p>
          Ainda não tem conta?{" "}
          <Link href="/register" className="link">
            Criar conta grátis
          </Link>
        </p>
      </div>

      <style>{formStyles}</style>
    </div>
  );
}

const formStyles = `
  .auth-form-container { width: 100%; }

  .auth-form-header { margin-bottom: 32px; }
  .auth-form-title {
    font-family: var(--font-display);
    font-size: 28px; font-weight: 800;
    color: var(--foreground); margin-bottom: 6px;
  }
  .auth-form-subtitle { font-size: 14px; color: var(--foreground-muted); }

  .alert {
    padding: 12px 16px; border-radius: var(--radius-md);
    font-size: 14px; margin-bottom: 20px;
  }
  .alert-warning {
    background: #fef3c7; color: #92400e;
    border: 1px solid #fde68a;
  }
  .alert-error {
    background: #fee2e2; color: #991b1b;
    border: 1px solid #fecaca;
  }
  .alert-success {
    background: #d1fae5; color: #065f46;
    border: 1px solid #a7f3d0;
  }

  .auth-form-footer {
    margin-top: 28px; text-align: center;
    font-size: 14px; color: var(--foreground-muted);
  }
  .link { color: var(--primary); font-weight: 600; text-decoration: none; }
  .link:hover { text-decoration: underline; }
`;
