"use server";

import { db } from "@/lib/db";
import {
  users,
  verificationTokens,
  couples,
  inviteCodes,
} from "@/lib/db/schema";
import { registerSchema, loginSchema, forgotPasswordSchema } from "@/lib/validators/auth";
import { generateToken, generateInviteCode } from "@/lib/utils";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/utils/email";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/lib/auth";
import { AuthError, CredentialsSignin } from "next-auth";
import { redirect } from "next/navigation";
import { nanoid } from "nanoid";

// ── Register ──────────────────────────────────────────────────────────────────
export async function registerAction(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { name, email, password } = parsed.data;

  // Check if email already exists
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    return { error: "Este e-mail já está cadastrado." };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const [user] = await db
    .insert(users)
    .values({
      name,
      email,
      password: hashedPassword,
    })
    .returning({ id: users.id });

  // Generate verification token (expires in 24h)
  const token = generateToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.insert(verificationTokens).values({
    identifier: email,
    token,
    expires,
  });

  const sendResult = await sendVerificationEmail(email, name, token);
  if (!sendResult.ok) {
    console.error("sendVerificationEmail:", sendResult.message);
  }

  return {
    success: true,
    email,
    emailSent: sendResult.ok,
    emailError: sendResult.ok ? undefined : sendResult.message,
  };
}

// ── Reenviar link de verificação ───────────────────────────────────────────────
export async function resendVerificationEmailAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email) {
    return { error: "Informe o e-mail usado no cadastro." };
  }

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      emailVerified: users.emailVerified,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    return { success: true as const };
  }

  if (user.emailVerified) {
    return { error: "Este e-mail já está confirmado. Você pode entrar normalmente." };
  }

  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.identifier, email));

  const token = generateToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.insert(verificationTokens).values({
    identifier: email,
    token,
    expires,
  });

  const sendResult = await sendVerificationEmail(email, user.name, token);
  if (!sendResult.ok) {
    console.error("resendVerificationEmail:", sendResult.message);
    return { error: sendResult.message };
  }

  return { success: true as const };
}

// ── Verify email ──────────────────────────────────────────────────────────────
export async function verifyEmailAction(token: string) {
  if (!token) return { error: "Token inválido." };

  const [record] = await db
    .select()
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.token, token),
        gt(verificationTokens.expires, new Date())
      )
    )
    .limit(1);

  if (!record) {
    return { error: "Link inválido ou expirado. Solicite um novo." };
  }

  // Mark user as verified
  await db
    .update(users)
    .set({ emailVerified: new Date() })
    .where(eq(users.email, record.identifier));

  // Delete used token
  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.token, token));

  return { success: true };
}

// ── Login ─────────────────────────────────────────────────────────────────────
export async function loginAction(formData: FormData) {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (
      error instanceof CredentialsSignin &&
      error.code === "email_not_verified"
    ) {
      return { error: "Confirme seu e-mail antes de entrar." };
    }
    if (error instanceof AuthError) {
      return { error: "E-mail ou senha incorretos." };
    }
    throw error;
  }

  redirect("/dashboard");
}

// ── Forgot password ───────────────────────────────────────────────────────────
export async function forgotPasswordAction(formData: FormData) {
  const raw = { email: formData.get("email") as string };
  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { email } = parsed.data;

  const [user] = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  // Always return success to avoid email enumeration
  if (!user) return { success: true };

  // Delete any existing reset tokens for this email
  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.identifier, `reset:${email}`));

  const token = generateToken();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h

  await db.insert(verificationTokens).values({
    identifier: `reset:${email}`,
    token,
    expires,
  });

  const sendResult = await sendPasswordResetEmail(email, user.name, token);
  if (!sendResult.ok) {
    console.error("sendPasswordResetEmail:", sendResult.message);
  }

  return { success: true };
}

// ── Reset password ────────────────────────────────────────────────────────────
export async function resetPasswordAction(token: string, password: string) {
  if (!token || !password) return { error: "Dados inválidos." };

  const [record] = await db
    .select()
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.token, token),
        gt(verificationTokens.expires, new Date())
      )
    )
    .limit(1);

  if (!record || !record.identifier.startsWith("reset:")) {
    return { error: "Link inválido ou expirado. Solicite um novo." };
  }

  const email = record.identifier.replace("reset:", "");
  const hashedPassword = await bcrypt.hash(password, 12);

  await db
    .update(users)
    .set({ password: hashedPassword, updatedAt: new Date() })
    .where(eq(users.email, email));

  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.token, token));

  return { success: true };
}

// ── Logout ────────────────────────────────────────────────────────────────────
export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

// ── Create couple ─────────────────────────────────────────────────────────────
export async function createCoupleAction(
  userId: string,
  startDate: string
) {
  // Check user isn't already in a couple
  const [user] = await db
    .select({ coupleId: users.coupleId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user || user.coupleId) {
    return { error: "Você já está vinculado a um casal." };
  }

  // Create couple
  const [couple] = await db
    .insert(couples)
    .values({ startDate })
    .returning({ id: couples.id });

  // Link user to couple
  await db
    .update(users)
    .set({ coupleId: couple.id, updatedAt: new Date() })
    .where(eq(users.id, userId));

  // Generate invite code (valid for 7 days)
  const code = generateInviteCode();
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db.insert(inviteCodes).values({
    code,
    coupleId: couple.id,
    createdById: userId,
    expiresAt: expires,
  });

  return { success: true, coupleId: couple.id, inviteCode: code };
}

// ── Join couple via invite ────────────────────────────────────────────────────
export async function joinCoupleAction(userId: string, code: string) {
  const upperCode = code.toUpperCase().trim();

  const [invite] = await db
    .select()
    .from(inviteCodes)
    .where(
      and(
        eq(inviteCodes.code, upperCode),
        eq(inviteCodes.used, false),
        gt(inviteCodes.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!invite) return { error: "Código inválido ou expirado." };

  // Make sure user isn't the invite creator
  if (invite.createdById === userId) {
    return { error: "Você não pode usar seu próprio código de convite." };
  }

  // Check user isn't already in a couple
  const [user] = await db
    .select({ coupleId: users.coupleId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user?.coupleId) return { error: "Você já está vinculado a um casal." };

  // Link user to couple
  await db
    .update(users)
    .set({ coupleId: invite.coupleId, updatedAt: new Date() })
    .where(eq(users.id, userId));

  // Mark invite as used
  await db
    .update(inviteCodes)
    .set({ used: true })
    .where(eq(inviteCodes.id, invite.id));

  return { success: true, coupleId: invite.coupleId };
}
