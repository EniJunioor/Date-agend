import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { InviteFlow } from "@/components/auth/InviteFlow";

export const metadata: Metadata = { title: "Vincular casal" };

export default async function InvitePage({
  searchParams,
}: {
  searchParams: { code?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // If already has couple, go to dashboard
  if (session.user.coupleId) redirect("/dashboard");

  return (
    <div className="invite-page">
      <div className="invite-card">
        <div className="invite-hero">
          <div className="invite-hero-bg" />
          <div className="invite-emoji">💑</div>
          <h1 className="invite-title">Conecte-se com seu amor</h1>
          <p className="invite-sub">
            Crie um casal e convide seu/sua parceiro(a) para compartilhar memórias juntos.
          </p>
        </div>

        <InviteFlow
          userId={session.user.id}
          prefilledCode={searchParams.code}
        />
      </div>

      <style>{`
        .invite-page {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          background: var(--background-subtle);
        }
        .invite-card {
          width: 100%; max-width: 480px;
          background: var(--background);
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border);
        }
        .invite-hero {
          position: relative; overflow: hidden;
          background: linear-gradient(135deg, #1a0533, var(--primary));
          padding: 40px 32px; text-align: center; color: white;
        }
        .invite-hero-bg {
          position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(244,114,182,0.25) 0%, transparent 70%);
        }
        .invite-emoji { font-size: 52px; margin-bottom: 12px; position: relative; z-index: 1; animation: pulse-heart 2s ease-in-out infinite; }
        .invite-title {
          font-family: var(--font-display);
          font-size: 26px; font-weight: 800; margin-bottom: 8px; position: relative; z-index: 1;
        }
        .invite-sub { font-size: 14px; opacity: 0.75; line-height: 1.6; position: relative; z-index: 1; }
      `}</style>
    </div>
  );
}
