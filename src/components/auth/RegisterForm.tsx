"use client";

import { useState, useTransition } from "react";
import {
  registerAction,
  resendVerificationEmailAction,
} from "@/app/actions/auth";
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

type DoneState = {
  email: string;
  emailSent: boolean;
  emailError?: string;
};

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<DoneState | null>(null);
  const [password, setPassword] = useState("");
  const [resendPending, setResendPending] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

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
        setDone({
          email: result.email ?? email,
          emailSent: result.emailSent !== false,
          emailError: result.emailError,
        });
      }
    });
  }

  async function handleResendVerification() {
    if (!done?.email) return;
    setResendMsg(null);
    setResendPending(true);
    const fd = new FormData();
    fd.set("email", done.email);
    const r = await resendVerificationEmailAction(fd);
    setResendPending(false);
    if ("error" in r && r.error) {
      setResendMsg(r.error);
    } else {
      setResendMsg(
        "Se existir cadastro pendente com esse e-mail, reenviamos o link. Confira a caixa de entrada e o spam."
      );
    }
  }

  if (done) {
    return (
      <div>
        <h2 className="auth-split-page-title" style={{ marginBottom: "0.5rem" }}>
          Verifique seu e-mail
        </h2>
        {done.emailSent ? (
          <p className="auth-split-page-sub" style={{ marginBottom: "1rem" }}>
            Enviamos um link de confirmação para <strong>{done.email}</strong>.
          </p>
        ) : (
          <>
            <div
              className="auth-split-alert auth-split-alert--warn"
              role="status"
              style={{ marginBottom: "1rem", textAlign: "left" }}
            >
              <strong>Não conseguimos enviar o e-mail agora.</strong>
              {done.emailError ? (
                <span style={{ display: "block", marginTop: "0.5rem" }}>
                  Detalhe: {done.emailError}
                </span>
              ) : null}
              <span style={{ display: "block", marginTop: "0.65rem", fontSize: "0.85rem" }}>
                Confira se <code style={{ fontSize: "0.8em" }}>RESEND_API_KEY</code> está
                correta no servidor, se o domínio do remetente está verificado no painel da
                Resend e se o e-mail de destino está autorizado (em testes, às vezes só o
                e-mail da conta Resend recebe).
              </span>
            </div>
            <p className="auth-split-page-sub" style={{ marginBottom: "1rem" }}>
              Sua conta em <strong>{done.email}</strong> foi criada — assim que o envio
              funcionar, use o botão abaixo para receber o link.
            </p>
          </>
        )}
        {resendMsg ? (
          <div
            className={`auth-split-alert${
              resendMsg.startsWith("Se existir") ? " auth-split-alert--warn" : " auth-split-alert--err"
            }`}
            role="status"
            style={{ marginBottom: "1rem" }}
          >
            {resendMsg}
          </div>
        ) : null}
        <button
          type="button"
          className="auth-split-btn-primary"
          style={{ marginTop: 0 }}
          disabled={resendPending}
          onClick={handleResendVerification}
        >
          {resendPending ? "Enviando..." : "Reenviar link de confirmação"}
        </button>
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
