import type { Metadata } from "next";
import { verifyEmailAction } from "@/app/actions/auth";
import { VerifyEmailResult } from "@/components/auth/VerifyEmailResult";

export const metadata: Metadata = { title: "Verificar E-mail" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <VerifyEmailResult success={false} error="Link inválido. Solicite um novo e-mail de verificação." />;
  }

  const result = await verifyEmailAction(token);

  return <VerifyEmailResult success={!!result.success} error={result.error} />;
}
