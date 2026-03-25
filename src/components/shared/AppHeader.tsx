"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppIcon } from "@/components/ui/app-icon";

interface AppHeaderProps {
  user: {
    name: string;
    email: string;
    image: string | null;
  } | undefined;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Início",
  "/calendar": "Calendário",
  "/timeline": "Linha do Tempo",
  "/gallery": "Galeria",
  "/about-us": "Sobre Nós",
  "/achievements": "Conquistas",
  "/stats": "Estatísticas",
  "/capsules": "Cápsulas do Tempo",
  "/notifications": "Notificações",
  "/settings": "Configurações",
};

export function AppHeader({ user }: AppHeaderProps) {
  const pathname = usePathname();

  const title = Object.entries(pageTitles).find(
    ([key]) => pathname === key || pathname.startsWith(key + "/")
  )?.[1] ?? "Calendário do Casal";

  return (
    <header className="app-header">
      <h1 className="app-header-title">{title}</h1>

      <div className="app-header-actions">
        <Link href="/calendar" className="header-create-btn" aria-label="Criar evento">
          <span aria-hidden="true">+</span>
          <span className="header-create-label">Novo evento</span>
        </Link>

        <Link href="/notifications" className="header-icon-btn" aria-label="Notificações">
          <AppIcon name="bell" size={18} />
        </Link>

        <Link href="/settings" className="header-avatar" aria-label="Configurações">
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt={user.name} width={32} height={32} style={{ objectFit: "cover" }} />
          ) : (
            <span>{user?.name?.[0]?.toUpperCase() ?? "?"}</span>
          )}
        </Link>
      </div>

      <style>{`
        .app-header {
          height: 60px;
          background: var(--background);
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center;
          padding: 0 28px;
          gap: 16px;
          position: sticky; top: 0; z-index: 20;
        }
        @media (max-width: 768px) { .app-header { padding: 0 16px; } }

        .app-header-title {
          font-family: var(--font-display);
          font-size: 18px; font-weight: 700;
          color: var(--foreground); flex: 1;
        }

        .app-header-actions {
          display: flex; align-items: center; gap: 10px;
        }

        .header-create-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: var(--radius-md);
          background: var(--primary); color: white;
          text-decoration: none; font-size: 13px; font-weight: 600;
          transition: all 0.2s;
        }
        .header-create-btn:hover { filter: brightness(1.08); }
        .header-create-label { display: none; }
        @media (min-width: 640px) { .header-create-label { display: inline; } }

        .header-icon-btn {
          width: 36px; height: 36px; border-radius: var(--radius-md);
          display: flex; align-items: center; justify-content: center;
          text-decoration: none; font-size: 16px;
          background: var(--card);
          border: 1px solid var(--border);
          transition: all 0.15s;
        }
        .header-icon-btn:hover { border-color: var(--primary-light); }

        .header-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: var(--primary-surface); color: var(--primary);
          text-decoration: none; font-size: 13px; font-weight: 700;
          border: 2px solid var(--primary-surface-strong);
          overflow: hidden;
          transition: border-color 0.15s;
        }
        .header-avatar:hover { border-color: var(--primary); }
      `}</style>
    </header>
  );
}
