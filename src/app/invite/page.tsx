import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { InviteFlow } from "@/components/auth/InviteFlow";

export const metadata: Metadata = { title: "Vincular casal" };

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  if (session.user.coupleId) redirect("/dashboard");

  const params = await searchParams;

  return (
    <div className="invite2-root">
      {/* Blurred background */}
      <div className="invite2-bg" aria-hidden="true">
        <div className="inv-bg-blob inv-bg-blob-1" />
        <div className="inv-bg-blob inv-bg-blob-2" />
        <div className="invite2-preview-text">
          Bem-vindos ao seu espaço <span>compartilhado.</span>
          <p>Organize momentos, datas importantes e memórias do casal em um só lugar.</p>
        </div>
      </div>

      {/* Modal card */}
      <div className="invite2-modal">
        {/* Hearts header */}
        <div className="inv-modal-top">
          <div className="inv-hearts">
            <div className="inv-heart-wrap"><span>♥</span></div>
            <div className="inv-connector" />
            <div className="inv-heart-wrap"><span>♥</span></div>
          </div>
        </div>

        <div className="inv-modal-body">
          <h2 className="inv-modal-title">Convidar Parceiro(a)</h2>
          <p className="inv-modal-desc">
            Para usar o app juntos, o outro deve se cadastrar e usar o código de convite abaixo.
          </p>

          <InviteFlow userId={session.user.id} prefilledCode={params.code} />
        </div>
      </div>

      <style>{`
        .invite2-root {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #f8e8f5 0%, #eef3ff 100%);
        }

        /* Background */
        .invite2-bg {
          position: absolute; inset: 0;
          filter: blur(0px);
          display: flex; align-items: center;
          padding: 40px;
        }
        .inv-bg-blob {
          position: absolute; border-radius: 50%;
          filter: blur(60px); opacity: 0.5;
        }
        .inv-bg-blob-1 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(219,39,119,0.2), transparent);
          top: -100px; left: -100px;
        }
        .inv-bg-blob-2 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(99,102,241,0.15), transparent);
          bottom: -80px; right: -80px;
        }
        .invite2-preview-text {
          position: relative; z-index: 1;
          font-size: clamp(32px, 4vw, 52px);
          font-weight: 900; color: rgba(17,24,39,0.15);
          letter-spacing: -0.03em;
          max-width: 500px;
          line-height: 1.1;
          pointer-events: none;
        }
        .invite2-preview-text span { color: rgba(219,39,119,0.2); }
        .invite2-preview-text p { font-size: 14px; font-weight: 400; color: rgba(107,114,128,0.35); margin-top: 12px; line-height: 1.6; }

        /* Modal */
        .invite2-modal {
          position: relative; z-index: 10;
          width: 100%; max-width: 480px;
          background: white;
          border-radius: 28px;
          box-shadow: 0 40px 120px rgba(15,23,42,0.18);
          overflow: hidden;
        }

        /* Hearts */
        .inv-modal-top {
          background: linear-gradient(135deg, #ffd6e8 0%, #fce7f3 100%);
          padding: 32px 32px 20px;
          display: flex; justify-content: center;
        }
        .inv-hearts {
          display: flex; align-items: center; gap: 12px;
        }
        .inv-heart-wrap {
          width: 56px; height: 56px; border-radius: 16px;
          background: white;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; color: #db2777;
          box-shadow: 0 8px 24px rgba(219,39,119,0.15);
        }
        .inv-connector {
          width: 40px; height: 2px;
          background: linear-gradient(90deg, #db2777, #f9a8d4);
          border-radius: 999px;
        }

        /* Body */
        .inv-modal-body { padding: 24px 32px 32px; }
        .inv-modal-title {
          font-size: 22px; font-weight: 900; color: #111827;
          text-align: center; margin: 0 0 8px;
          letter-spacing: -0.02em;
        }
        .inv-modal-desc {
          font-size: 13px; color: #6b7280; text-align: center;
          line-height: 1.6; margin: 0 0 24px;
        }
      `}</style>
    </div>
  );
}
