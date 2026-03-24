import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@calendariodocasal.com.br";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Calendário do Casal";

// ── Email verification ────────────────────────────────────────────────────────
export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
) {
  const link = `${APP_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: `${APP_NAME} <${FROM}>`,
    to: email,
    subject: "Confirme seu e-mail ❤️",
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px;background:#fff;border-radius:12px;">
        <h1 style="color:#db2777;margin-bottom:8px;">Olá, ${name}! ❤️</h1>
        <p style="color:#374151;line-height:1.6;">
          Bem-vindo(a) ao <strong>${APP_NAME}</strong>! Clique no botão abaixo para confirmar seu e-mail e começar a registrar os momentos mais especiais do seu relacionamento.
        </p>
        <a href="${link}" style="display:inline-block;margin:24px 0;background:#db2777;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;">
          Confirmar E-mail
        </a>
        <p style="color:#9ca3af;font-size:13px;">
          Este link expira em 24 horas. Se você não criou uma conta, ignore este e-mail.
        </p>
      </div>
    `,
  });
}

// ── Password reset ────────────────────────────────────────────────────────────
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
) {
  const link = `${APP_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: `${APP_NAME} <${FROM}>`,
    to: email,
    subject: "Redefinir sua senha",
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px;background:#fff;border-radius:12px;">
        <h1 style="color:#db2777;margin-bottom:8px;">Redefinir senha</h1>
        <p style="color:#374151;line-height:1.6;">
          Olá, ${name}! Recebemos uma solicitação para redefinir a senha da sua conta.
        </p>
        <a href="${link}" style="display:inline-block;margin:24px 0;background:#db2777;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;">
          Redefinir Senha
        </a>
        <p style="color:#9ca3af;font-size:13px;">
          Este link expira em 1 hora. Se você não solicitou isso, ignore este e-mail.
        </p>
      </div>
    `,
  });
}

// ── Event reminder ────────────────────────────────────────────────────────────
export async function sendEventReminderEmail(
  email: string,
  name: string,
  eventTitle: string,
  eventDate: string,
  daysAhead: number
) {
  const when = daysAhead === 0 ? "hoje" : daysAhead === 1 ? "amanhã" : `em ${daysAhead} dias`;

  await resend.emails.send({
    from: `${APP_NAME} <${FROM}>`,
    to: email,
    subject: `Lembrete: ${eventTitle} é ${when} 💕`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px;background:#fff;border-radius:12px;">
        <h1 style="color:#db2777;margin-bottom:8px;">Lembrete de evento 📅</h1>
        <p style="color:#374151;line-height:1.6;">
          Olá, ${name}! Só um lembrete que <strong>${eventTitle}</strong> é ${when} (${eventDate}).
        </p>
        <a href="${APP_URL}/calendar" style="display:inline-block;margin:24px 0;background:#db2777;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;">
          Ver no Calendário
        </a>
      </div>
    `,
  });
}
