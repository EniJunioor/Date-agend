"use client";

import { useState, useTransition } from "react";
import {
  registerAction,
  resendVerificationEmailAction,
} from "@/app/actions/auth";
import { signIn } from "next-auth/react";

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 12a4.1 4.1 0 1 0-4.1-4.1A4.1 4.1 0 0 0 12 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M4.5 20c1.7-4 5.1-6 7.5-6s5.8 2 7.5 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m6.5 8 5.1 4.1c.9.72 2.1.72 3 0L19.5 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7.5 11V8.8A4.5 4.5 0 0 1 12 4.3a4.5 4.5 0 0 1 4.5 4.5V11"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M7 11h10a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
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
    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const pwd = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirm = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value;

    if (!acceptedTerms) {
      setError("Você precisa aceitar os termos para continuar.");
      return;
    }
    if (pwd !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (pwd.length < 8) {
      setError("A senha deve ter ao menos 8 caracteres.");
      return;
    }

    const fd = new FormData();
    fd.set("name", name);
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
      <div className="auth-modern-form">
        <h2 className="auth-modern-title" style={{ fontSize: 28, marginBottom: 8 }}>
          Verifique seu e-mail
        </h2>
        {done.emailSent ? (
          <p className="auth-modern-subtitle" style={{ marginBottom: 14 }}>
            Enviamos um link de confirmação para <strong>{done.email}</strong>.
          </p>
        ) : (
          <>
            <div
              className="auth-modern-alert auth-modern-alert--warn"
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
            <p className="auth-modern-subtitle" style={{ marginBottom: 14 }}>
              Sua conta em <strong>{done.email}</strong> foi criada — assim que o envio
              funcionar, use o botão abaixo para receber o link.
            </p>
          </>
        )}
        {resendMsg ? (
          <div
            className={`auth-modern-alert${
              resendMsg.startsWith("Se existir") ? " auth-modern-alert--warn" : " auth-modern-alert--err"
            }`}
            role="status"
            style={{ marginBottom: "1rem" }}
          >
            {resendMsg}
          </div>
        ) : null}
        <button
          type="button"
          className="auth-modern-primary"
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
    <div className="auth-modern-form">
      <form onSubmit={handleSubmit}>
        {error ? (
          <div className="auth-modern-alert auth-modern-alert--err" role="alert">
            {error}
          </div>
        ) : null}

        <div className="auth-modern-field">
          <div className="auth-modern-label-row">
            <label htmlFor="name" className="auth-modern-label">
              Full Name
            </label>
          </div>
          <div className="auth-modern-input-wrap">
            <span className="auth-modern-input-ic" aria-hidden="true">
              <UserIcon />
            </span>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="Enter your full name"
              className="auth-modern-input"
              disabled={isPending}
            />
          </div>
        </div>

        <div className="auth-modern-field">
          <div className="auth-modern-label-row">
            <label htmlFor="email" className="auth-modern-label">
              Email Address
            </label>
          </div>
          <div className="auth-modern-input-wrap">
            <span className="auth-modern-input-ic" aria-hidden="true">
              <MailIcon />
            </span>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="auth-modern-input"
              disabled={isPending}
            />
          </div>
        </div>

        <div className="auth-modern-row2">
          <div className="auth-modern-field" style={{ marginBottom: 0 }}>
            <div className="auth-modern-label-row">
              <label htmlFor="password" className="auth-modern-label">
                Password
              </label>
            </div>
            <div className="auth-modern-input-wrap">
              <span className="auth-modern-input-ic" aria-hidden="true">
                <LockIcon />
              </span>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="••••••••"
                className="auth-modern-input"
                disabled={isPending}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="auth-modern-strength" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`auth-modern-strength-bar${i < strength ? " is-on" : ""}`}
                />
              ))}
            </div>
          </div>

          <div className="auth-modern-field" style={{ marginBottom: 0 }}>
            <div className="auth-modern-label-row">
              <label htmlFor="confirmPassword" className="auth-modern-label">
                Confirm Password
              </label>
            </div>
            <div className="auth-modern-input-wrap">
              <span className="auth-modern-input-ic" aria-hidden="true">
                <LockIcon />
              </span>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                placeholder="••••••••"
                className="auth-modern-input"
                disabled={isPending}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
        </div>

        <label className="auth-modern-terms">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            disabled={isPending}
          />
          <span>
            I agree to the <a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a> and{" "}
            <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
          </span>
        </label>

        <button type="submit" className="auth-modern-primary" disabled={isPending}>
          {isPending ? "Criando..." : "Create My Account"}
        </button>
      </form>

      <div className="auth-modern-divider">OR CONTINUE WITH</div>

      <div className="auth-modern-social-row">
        <button
          type="button"
          className="auth-modern-social-btn"
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
