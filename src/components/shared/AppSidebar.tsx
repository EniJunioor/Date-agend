"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

interface SidebarProps {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    coupleId: string | null;
  } | undefined;
  couple: {
    id: string;
    theme: string | null;
    startDate: string;
  } | null;
}

const navItems = [
  { href: "/dashboard", icon: "🏠", label: "Início" },
  { href: "/calendar", icon: "📅", label: "Calendário" },
  { href: "/timeline", icon: "⏳", label: "Linha do Tempo" },
  { href: "/gallery", icon: "🖼️", label: "Galeria" },
  { href: "/about-us", icon: "💑", label: "Sobre Nós" },
  { href: "/achievements", icon: "🏆", label: "Conquistas" },
  { href: "/stats", icon: "📊", label: "Estatísticas" },
  { href: "/capsules", icon: "⏰", label: "Cápsulas" },
];

const bottomItems = [
  { href: "/notifications", icon: "🔔", label: "Notificações" },
  { href: "/settings", icon: "⚙️", label: "Configurações" },
];

export function AppSidebar({ user, couple }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">❤️</span>
          <span className="sidebar-logo-text">Casal</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${pathname === item.href || pathname.startsWith(item.href + "/") ? "nav-item-active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-bottom">
          {bottomItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${pathname === item.href ? "nav-item-active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}

          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt={user.name} width={32} height={32} style={{ borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <span>{user?.name?.[0]?.toUpperCase() ?? "?"}</span>
              )}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-email">{user?.email}</div>
            </div>
            <form action={logoutAction}>
              <button type="submit" className="sidebar-logout" title="Sair" aria-label="Sair">
                ↗
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-nav-item ${pathname === item.href ? "mobile-nav-active" : ""}`}
          >
            <span>{item.icon}</span>
            <span className="mobile-nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <style>{`
        /* ── Desktop Sidebar ─── */
        .sidebar {
          width: 220px;
          flex-shrink: 0;
          background: var(--background);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: sticky;
          top: 0;
          overflow-y: auto;
          padding: 20px 12px;
        }
        @media (max-width: 768px) { .sidebar { display: none; } }

        .sidebar-logo {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 12px; margin-bottom: 24px;
        }
        .sidebar-logo-icon { font-size: 22px; }
        .sidebar-logo-text {
          font-family: var(--font-display);
          font-weight: 800; font-size: 16px;
          color: var(--primary);
        }

        .sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 2px; }

        .nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: var(--radius-md);
          text-decoration: none; color: var(--foreground-muted);
          font-size: 14px; font-weight: 500;
          transition: all 0.15s ease;
        }
        .nav-item:hover {
          background: var(--primary-surface);
          color: var(--primary);
        }
        .nav-item-active {
          background: var(--primary-surface);
          color: var(--primary);
          font-weight: 600;
        }
        .nav-icon { font-size: 16px; width: 20px; text-align: center; }
        .nav-label { flex: 1; }

        .sidebar-bottom { display: flex; flex-direction: column; gap: 2px; padding-top: 16px; border-top: 1px solid var(--border); margin-top: 16px; }

        .sidebar-user {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 12px; margin-top: 8px;
        }
        .sidebar-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: var(--primary-surface);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: var(--primary);
          flex-shrink: 0; overflow: hidden;
        }
        .sidebar-user-info { flex: 1; min-width: 0; }
        .sidebar-user-name { font-size: 13px; font-weight: 600; color: var(--foreground); truncate: true; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sidebar-user-email { font-size: 11px; color: var(--foreground-subtle); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sidebar-logout {
          background: none; border: none; cursor: pointer;
          color: var(--foreground-subtle); font-size: 14px; padding: 4px;
          border-radius: var(--radius-sm);
          transition: color 0.15s;
        }
        .sidebar-logout:hover { color: var(--primary); }

        /* ── Mobile Bottom Nav ─── */
        .mobile-nav {
          display: none;
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
          background: var(--background);
          border-top: 1px solid var(--border);
          padding: 8px 0 max(8px, env(safe-area-inset-bottom));
        }
        @media (max-width: 768px) {
          .mobile-nav { display: flex; justify-content: space-around; }
        }

        .mobile-nav-item {
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          text-decoration: none; color: var(--foreground-muted);
          padding: 4px 12px; border-radius: var(--radius-sm);
          transition: color 0.15s;
          font-size: 18px;
        }
        .mobile-nav-item:hover, .mobile-nav-active { color: var(--primary); }
        .mobile-nav-label { font-size: 10px; font-weight: 500; }
      `}</style>
    </>
  );
}
