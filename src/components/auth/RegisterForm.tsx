"use client";

import { useState, useTransition } from "react";
import { registerAction } from "@/app/actions/auth";

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await registerAction(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(result.email ?? "seu e-mail");
      }
    });
  }

  if (success) {
    return (
      <div className="register-success">
        <h3>Verifique seu e-mail</h3>
        <p>
          Enviamos um link de confirmacao para <strong>{success}</strong>.
        </p>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="register-form">
      {error ? (
        <div className="alert" role="alert">
          {error}
        </div>
      ) : null}

      <div className="field">
        <label htmlFor="name">Nome completo</label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Seu nome"
          required
          disabled={isPending}
        />
      </div>

      <div className="field">
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@email.com"
          required
          disabled={isPending}
        />
      </div>

      <div className="field">
        <label htmlFor="password">Senha</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Minimo 8 caracteres"
          required
          disabled={isPending}
        />
      </div>

      <button type="submit" disabled={isPending}>
        {isPending ? "Criando conta..." : "Criar minha conta"}
      </button>

      <style>{styles}</style>
    </form>
  );
}

const styles = `
  .register-form {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .field label {
    font-size: 13px;
    font-weight: 600;
    color: var(--foreground);
  }
  .field input {
    width: 100%;
    padding: 11px 14px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    background: var(--background);
    color: var(--foreground);
    font-size: 14px;
    outline: none;
  }
  .field input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-surface);
  }
  button {
    width: 100%;
    padding: 13px;
    border-radius: var(--radius-md);
    background: var(--primary);
    color: white;
    font-size: 15px;
    font-weight: 700;
    border: none;
    cursor: pointer;
    margin-top: 4px;
  }
  button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  .alert {
    padding: 12px 16px;
    border-radius: var(--radius-md);
    font-size: 14px;
    background: #fee2e2;
    color: #991b1b;
    border: 1px solid #fecaca;
  }
  .register-success h3 {
    margin-bottom: 8px;
    font-size: 22px;
    color: var(--foreground);
  }
  .register-success p {
    color: var(--foreground-muted);
  }
`;
