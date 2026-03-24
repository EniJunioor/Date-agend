"use client";

import { useState, useTransition } from "react";
import { registerAction } from "@/app/actions/auth";
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

function passwordStrengthScore(pwd: string): number {
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 8) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  return Math.min(4, score);
}

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [password, setPassword] = useState("");

  const strength = passwordStrengthScore(password);

  async function handleGoogle() {
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const firstName = (
      form.elements.namedItem("firstName") as HTMLInputElement
    ).value.trim();
    const lastName = (
      form.elements.namedItem("lastName") as HTMLInputElement
    ).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const pwd = (form.elements.namedItem("password") as HTMLInputElement).value;

    const fd = new FormData();
    fd.set("name", [firstName, lastName].filter(Boolean).join(" ") || firstName);
    fd.set("email", email);
    fd.set("password", pwd);

    startTransition(async () => {
      const result = await registerAction(fd);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(result.email ?? email);
      }
    });
  }

  if (success) {
    return (
      <div>
        <h2 className="auth-split-page-title" style={{ marginBottom: "0.5rem" }}>
          Verifique seu e-mail
        </h2>
        <p className="auth-split-page-sub" style={{ marginBottom: 0 }}>
          Enviamos um link de confirmação para <strong>{success}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {error ? (
          <div className="auth-split-alert auth-split-alert--err" role="alert">
            {error}
          </div>
        ) : null}

        <div className="auth-split-row2">
          <div className="auth-split-field" style={{ marginBottom: "0.85rem" }}>
            <label htmlFor="firstName" className="auth-split-label">
              Nome
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              required
              placeholder="Ana"
              className="auth-split-input"
              disabled={isPending}
            />
          </div>
          <div className="auth-split-field" style={{ marginBottom: "0.85rem" }}>
            <label htmlFor="lastName" className="auth-split-label">
              Sobrenome
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              placeholder="Silva"
              className="auth-split-input"
              disabled={isPending}
            />
          </div>
        </div>

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
          <label htmlFor="password" className="auth-split-label">
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Mínimo 8 caracteres"
            className="auth-split-input"
            disabled={isPending}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="auth-split-strength" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`auth-split-strength-bar${i < strength ? " is-on" : ""}`}
              />
            ))}
          </div>
        </div>

        <button type="submit" className="auth-split-btn-primary" disabled={isPending}>
          {isPending ? "Criando conta..." : "Criar minha conta"}
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
