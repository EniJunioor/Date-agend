"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { signIn } from "next-auth/react";

interface LoginFormProps {
  callbackUrl?: string;
}

export function LoginForm({ callbackUrl = "/dashboard" }: LoginFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  async function handleGoogle() {
    await signIn("google", { callbackUrl });
  }

  return (
    <div className="form-wrapper">
      <button
        type="button"
        onClick={handleGoogle}
        className="btn-google"
        disabled={isPending}
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        Entrar com Google
      </button>

      <div className="form-divider">
        <span>ou</span>
      </div>

      <form action={handleSubmit} className="form">
        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        <div className="field">
          <label htmlFor="email" className="label">E-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="voce@email.com"
            className="input"
            disabled={isPending}
          />
        </div>

        <div className="field">
          <div className="field-header">
            <label htmlFor="password" className="label">Senha</label>
            <Link href="/forgot-password" className="link-sm">
              Esqueci minha senha
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="input"
            disabled={isPending}
          />
        </div>

        <button type="submit" className="btn-submit" disabled={isPending}>
          {isPending ? (
            <span className="spinner" aria-hidden="true" />
          ) : null}
          {isPending ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <style>{`
        .form-wrapper { display: flex; flex-direction: column; gap: 0; }

        .btn-google {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 12px; border-radius: var(--radius-md);
          border: 1px solid var(--border); background: var(--background);
          color: var(--foreground); font-size: 14px; font-weight: 500;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-google:hover { background: var(--card); border-color: var(--border-strong); }
        .btn-google:disabled { opacity: 0.6; cursor: not-allowed; }

        .form-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 20px 0;
        }
        .form-divider::before, .form-divider::after {
          content: ''; flex: 1; height: 1px; background: var(--border);
        }
        .form-divider span { font-size: 12px; color: var(--foreground-subtle); }

        .form { display: flex; flex-direction: column; gap: 16px; }

        .field { display: flex; flex-direction: column; gap: 6px; }
        .field-header { display: flex; justify-content: space-between; align-items: center; }
        .label { font-size: 13px; font-weight: 600; color: var(--foreground); }
        .link-sm { font-size: 12px; color: var(--primary); text-decoration: none; }
        .link-sm:hover { text-decoration: underline; }

        .input {
          width: 100%; padding: 11px 14px; border-radius: var(--radius-md);
          border: 1px solid var(--border); background: var(--background);
          color: var(--foreground); font-size: 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .input::placeholder { color: var(--foreground-subtle); }
        .input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-surface); }
        .input:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-submit {
          width: 100%; padding: 13px; border-radius: var(--radius-md);
          background: var(--primary); color: white;
          font-size: 15px; font-weight: 700;
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: var(--shadow-primary);
          transition: all 0.2s;
          margin-top: 4px;
        }
        .btn-submit:hover { filter: brightness(1.08); transform: translateY(-1px); }
        .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

        .spinner {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: white;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .alert {
          padding: 12px 16px; border-radius: var(--radius-md);
          font-size: 14px;
        }
        .alert-error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
      `}</style>
    </div>
  );
}
