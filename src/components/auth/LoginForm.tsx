"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { signIn } from "next-auth/react";

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

interface LoginFormProps {
  callbackUrl?: string;
}

export function LoginForm({ callbackUrl = "/dashboard" }: LoginFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  async function handleGoogle() {
    await signIn("google", { callbackUrl });
  }

  return (
    <div>
      <form onSubmit={handleSubmit} method="post">
        {error ? (
          <div className="auth-split-alert auth-split-alert--err" role="alert">
            {error}
          </div>
        ) : null}

        <div className="auth-split-field">
          <label htmlFor="email" className="auth-split-label">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="voce@email.com"
            className="auth-split-input"
            disabled={isPending}
          />
        </div>

        <div className="auth-split-field">
          <div className="auth-split-field-header">
            <label htmlFor="password" className="auth-split-label">
              Senha
            </label>
            <Link href="/forgot-password" className="auth-split-link-sm">
              Esqueci minha senha
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Mínimo 8 caracteres"
            className="auth-split-input"
            disabled={isPending}
          />
        </div>

        <button type="submit" className="auth-split-btn-primary" disabled={isPending}>
          {isPending ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <div className="auth-split-divider">
        <span>Ou continue com</span>
      </div>

      <div className="auth-split-social-row">
        <button
          type="button"
          className="auth-split-btn-social"
          onClick={handleGoogle}
          disabled={isPending}
        >
          <GoogleGlyph />
          Google
        </button>
      </div>
    </div>
  );
}
