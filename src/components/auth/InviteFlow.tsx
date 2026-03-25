"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCoupleAction, joinCoupleAction } from "@/app/actions/auth";
import { AppIcon } from "@/components/ui/app-icon";

interface InviteFlowProps {
  userId: string;
  prefilledCode?: string;
}

type Tab = "create" | "join";

export function InviteFlow({ userId, prefilledCode }: InviteFlowProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(prefilledCode ? "join" : "create");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleCreate(formData: FormData) {
    setError(null);
    const startDate = formData.get("startDate") as string;
    if (!startDate) { setError("Selecione a data de início do relacionamento."); return; }

    startTransition(async () => {
      const result = await createCoupleAction(userId, startDate);
      if (result?.error) setError(result.error);
      else if (result?.success) setInviteCode(result.inviteCode!);
    });
  }

  async function handleJoin(formData: FormData) {
    setError(null);
    const code = (formData.get("code") as string).trim().toUpperCase();
    if (code.length !== 6) { setError("O código deve ter 6 caracteres."); return; }

    startTransition(async () => {
      const result = await joinCoupleAction(userId, code);
      if (result?.error) setError(result.error);
      else if (result?.success) router.push("/dashboard");
    });
  }

  const copyCode = async () => {
    if (!inviteCode) return;
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── After creating couple, show invite code ────────────────────────────────
  if (inviteCode) {
    return (
      <div style={{ padding: 32, display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <AppIcon name="party-popper" size={40} style={{ color: "var(--primary)" }} />
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--foreground)", marginBottom: 8 }}>
            Casal criado!
          </h2>
          <p style={{ fontSize: 14, color: "var(--foreground-muted)", lineHeight: 1.6 }}>
            Compartilhe o código abaixo com seu/sua parceiro(a) para vocês ficarem conectados.
          </p>
        </div>

        <div style={{
          background: "var(--primary-surface)",
          border: "2px dashed var(--primary-light)",
          borderRadius: "var(--radius-lg)",
          padding: "20px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
            Código de convite
          </div>
          <div style={{
            fontFamily: "var(--font-display)",
            fontSize: 40, fontWeight: 900,
            color: "var(--primary)", letterSpacing: 6,
            marginBottom: 12
          }}>
            {inviteCode}
          </div>
          <button
            onClick={copyCode}
            style={{
              padding: "8px 20px", borderRadius: "var(--radius-md)",
              background: copied ? "#059669" : "var(--primary)",
              color: "white", border: "none", fontSize: 13, fontWeight: 600,
              cursor: "pointer", transition: "all 0.2s"
            }}
          >
            {copied ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <AppIcon name="check" size={16} /> Copiado
              </span>
            ) : (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <AppIcon name="copy" size={16} /> Copiar código
              </span>
            )}
          </button>
        </div>

        <p style={{ fontSize: 12, color: "var(--foreground-subtle)", textAlign: "center" }}>
          O código expira em 7 dias. Seu/sua parceiro(a) deve criar uma conta e inserir este código.
        </p>

        <button
          onClick={() => router.push("/dashboard")}
          style={{
            padding: "13px", borderRadius: "var(--radius-md)",
            background: "var(--primary)", color: "white",
            border: "none", fontSize: 15, fontWeight: 700,
            cursor: "pointer", boxShadow: "var(--shadow-primary)"
          }}
        >
          Ir para o Dashboard →
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 32 }}>
      {/* Tabs */}
      <div style={{
        display: "flex", marginBottom: 24,
        background: "var(--card)", borderRadius: "var(--radius-md)",
        padding: 4
      }}>
        {(["create", "join"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(null); }}
            style={{
              flex: 1, padding: "9px 0",
              borderRadius: "var(--radius-sm)",
              border: "none", cursor: "pointer",
              fontSize: 14, fontWeight: 600,
              transition: "all 0.15s",
              background: tab === t ? "var(--background)" : "transparent",
              color: tab === t ? "var(--primary)" : "var(--foreground-muted)",
              boxShadow: tab === t ? "var(--shadow-sm)" : "none"
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <AppIcon name={t === "create" ? "users" : "link-2"} size={16} />
              {t === "create" ? "Criar casal" : "Entrar em um casal"}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <div style={{
          padding: "12px 16px", borderRadius: "var(--radius-md)",
          background: "#fee2e2", color: "#991b1b",
          border: "1px solid #fecaca", fontSize: 14, marginBottom: 16
        }}>
          {error}
        </div>
      )}

      {/* Create tab */}
      {tab === "create" && (
        <form action={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", display: "block", marginBottom: 6 }}>
              Quando começou o relacionamento? *
            </label>
            <input
              type="date" name="startDate" required
              max={new Date().toISOString().split("T")[0]}
              style={{
                width: "100%", padding: "11px 14px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                background: "var(--background)", color: "var(--foreground)",
                fontSize: 14, outline: "none"
              }}
            />
          </div>

          <p style={{ fontSize: 13, color: "var(--foreground-muted)", lineHeight: 1.6 }}>
            Depois de criar o casal, você receberá um código de convite para compartilhar com seu/sua parceiro(a).
          </p>

          <button
            type="submit" disabled={isPending}
            style={{
              padding: "13px", borderRadius: "var(--radius-md)",
              background: "var(--primary)", color: "white",
              border: "none", fontSize: 15, fontWeight: 700,
              cursor: isPending ? "not-allowed" : "pointer",
              opacity: isPending ? 0.7 : 1,
              boxShadow: "var(--shadow-primary)"
            }}
          >
            {isPending ? "Criando..." : "Criar casal"}
          </button>
        </form>
      )}

      {/* Join tab */}
      {tab === "join" && (
        <form action={handleJoin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", display: "block", marginBottom: 6 }}>
              Código de convite (6 caracteres) *
            </label>
            <input
              type="text" name="code" required
              defaultValue={prefilledCode ?? ""}
              placeholder="Ex: ABC123"
              maxLength={6}
              style={{
                width: "100%", padding: "11px 14px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                background: "var(--background)", color: "var(--foreground)",
                fontSize: 20, fontWeight: 800, letterSpacing: 6,
                textAlign: "center", textTransform: "uppercase", outline: "none"
              }}
            />
          </div>

          <p style={{ fontSize: 13, color: "var(--foreground-muted)", lineHeight: 1.6 }}>
            Peça o código para seu/sua parceiro(a) e insira aqui para ficarem conectados.
          </p>

          <button
            type="submit" disabled={isPending}
            style={{
              padding: "13px", borderRadius: "var(--radius-md)",
              background: "var(--primary)", color: "white",
              border: "none", fontSize: 15, fontWeight: 700,
              cursor: isPending ? "not-allowed" : "pointer",
              opacity: isPending ? 0.7 : 1,
              boxShadow: "var(--shadow-primary)"
            }}
          >
            {isPending ? "Entrando..." : "Entrar no casal"}
          </button>
        </form>
      )}
    </div>
  );
}
