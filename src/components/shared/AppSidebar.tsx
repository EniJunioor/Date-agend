"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { logoutAction } from "@/app/actions/auth";
import { AppIcon, type AppIconName } from "@/components/ui/app-icon";
import { getDaysTogether } from "@/lib/utils";

const SB_PINK = "#D84C70";
const SB_PINK_SOFT = "rgba(216, 76, 112, 0.12)";
const SB_TEXT = "#18181b";
const SB_MUTED = "#71717a";
const SB_BORDER = "#f4f4f5";
const SB_ICON_BG = "#f4f4f5";

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
  partner: {
    name: string;
    image: string | null;
  } | null;
  /** Fotos dos últimos 14 dias — badge na Galeria */
  galleryRecentPhotoCount: number;
}

type NavDef = {
  href: string;
  icon: AppIconName;
  label: string;
  badge?: number;
};

const menuItems: NavDef[] = [
  { href: "/dashboard", icon: "home", label: "Início" },
  { href: "/calendar", icon: "calendar", label: "Calendário" },
  { href: "/timeline", icon: "activity", label: "Linha do Tempo" },
  { href: "/gallery", icon: "image", label: "Galeria" },
];

const nossoEspacoItems: NavDef[] = [
  { href: "/about-us", icon: "heart", label: "Sobre Nós" },
  { href: "/achievements", icon: "star", label: "Conquistas" },
  { href: "/stats", icon: "bar-chart-3", label: "Estatísticas" },
  { href: "/capsules", icon: "hexagon", label: "Cápsulas" },
];

function formatSinceLabel(iso: string): string {
  const d = parseISO(iso);
  const mon = format(d, "MMM", { locale: ptBR }).replace(/\./g, "").toUpperCase();
  const year = format(d, "yyyy");
  return `DESDE ${mon}. ${year}`;
}

function initial(name: string | undefined | null): string {
  const t = name?.trim();
  return t ? t[0]!.toUpperCase() : "?";
}

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppSidebar({ user, couple, partner, galleryRecentPhotoCount }: SidebarProps) {
  const pathname = usePathname();
  const daysTogether = couple?.startDate ? getDaysTogether(couple.startDate) : 0;
  const galleryBadge =
    galleryRecentPhotoCount > 0 ? Math.min(galleryRecentPhotoCount, 99) : 0;

  const menuWithBadge = menuItems.map((item) =>
    item.href === "/gallery" && galleryBadge > 0 ? { ...item, badge: galleryBadge } : item
  );

  const allMobile = [...menuWithBadge, ...nossoEspacoItems];

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-inner">
          {/* Logo */}
          <div className="sidebar-logo">
            <span className="sidebar-logo-mark" aria-hidden>
              <AppIcon name="heart" size={20} color="#fff" fill="#fff" strokeWidth={2} />
            </span>
            <span className="sidebar-logo-text">Casal</span>
          </div>

          {/* Card dias juntos */}
          {couple?.startDate && (
            <div className="sidebar-card">
              <div className="sidebar-card-avatars">
                <span className="sb-av sb-av-1">
                  {user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt="" width={36} height={36} />
                  ) : (
                    initial(user?.name)
                  )}
                </span>
                <span className="sb-heart-wrap" aria-hidden>
                  <AppIcon name="heart" size={12} color={SB_PINK} fill={SB_PINK} strokeWidth={2} />
                </span>
                <span className="sb-av sb-av-2">
                  {partner?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={partner.image} alt="" width={36} height={36} />
                  ) : (
                    initial(partner?.name)
                  )}
                </span>
              </div>
              <p className="sidebar-card-kicker">Dias juntos</p>
              <p className="sidebar-card-num">{daysTogether.toLocaleString("pt-BR")}</p>
              <p className="sidebar-card-since">{formatSinceLabel(couple.startDate)}</p>
            </div>
          )}

          {/* Menu */}
          <p className="sidebar-section-label">Menu</p>
          <nav className="sidebar-nav-block">
            {menuWithBadge.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sb-link ${active ? "sb-link-active" : ""}`}
                >
                  <span className={`sb-ico-wrap ${active ? "sb-ico-wrap-active" : ""}`}>
                    <AppIcon
                      name={item.icon}
                      size={18}
                      strokeWidth={active ? 2.25 : 2}
                      color={active ? "#fff" : SB_MUTED}
                    />
                  </span>
                  <span className="sb-link-label">{item.label}</span>
                  {item.badge != null && item.badge > 0 ? (
                    <span className="sb-badge">{item.badge > 99 ? "99+" : item.badge}</span>
                  ) : (
                    <span className="sb-badge-spacer" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="sidebar-rule" />

          <p className="sidebar-section-label">Nosso espaço</p>
          <nav className="sidebar-nav-block">
            {nossoEspacoItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sb-link ${active ? "sb-link-active" : ""}`}
                >
                  <span className={`sb-ico-wrap ${active ? "sb-ico-wrap-active" : ""}`}>
                    <AppIcon
                      name={item.icon}
                      size={18}
                      strokeWidth={active ? 2.25 : 2}
                      color={active ? "#fff" : SB_MUTED}
                    />
                  </span>
                  <span className="sb-link-label">{item.label}</span>
                  <span className="sb-badge-spacer" />
                </Link>
              );
            })}
          </nav>

          <div className="sidebar-spacer" aria-hidden />

          <div className="sidebar-rule sidebar-rule-footer" />

          {/* Perfil */}
          <div className="sidebar-user">
            <div className="sidebar-user-av">
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt="" width={40} height={40} />
              ) : (
                initial(user?.name)
              )}
            </div>
            <div className="sidebar-user-text">
              <div className="sidebar-user-name">{user?.name ?? "—"}</div>
              <div className="sidebar-user-email">{user?.email ?? ""}</div>
            </div>
            <div className="sidebar-user-actions">
              <Link href="/settings" className="sb-icon-btn" title="Configurações" aria-label="Configurações">
                <AppIcon name="settings" size={18} color={SB_TEXT} strokeWidth={2} />
              </Link>
              <form action={logoutAction}>
                <button type="submit" className="sb-icon-btn" title="Sair" aria-label="Sair">
                  <AppIcon name="log-out" size={18} color={SB_TEXT} strokeWidth={2} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      <nav className="mobile-nav">
        {allMobile.slice(0, 5).map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-item ${active ? "mobile-nav-active" : ""}`}
            >
              <span className={active ? "mobile-nav-ico-active" : ""}>
                <AppIcon name={item.icon} size={20} color={active ? SB_PINK : SB_MUTED} />
              </span>
              <span className="mobile-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <style>{`
        .sidebar {
          width: 268px;
          flex-shrink: 0;
          background: #ffffff;
          border-right: 1px solid ${SB_BORDER};
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: sticky;
          top: 0;
          overflow: hidden;
          padding: 20px 14px 24px;
        }
        .sidebar > .sidebar-inner {
          overflow-y: auto;
        }
        @media (max-width: 768px) {
          .sidebar { display: none; }
        }

        .sidebar-inner {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
        }
        .sidebar-spacer {
          flex: 1;
          min-height: 16px;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 4px 8px 20px;
        }
        .sidebar-logo-mark {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: ${SB_PINK};
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 8px ${SB_PINK_SOFT};
        }
        .sidebar-logo-text {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 22px;
          letter-spacing: -0.02em;
          color: ${SB_TEXT};
        }

        .sidebar-card {
          background: #fafafa;
          border: 1px solid ${SB_BORDER};
          border-radius: 16px;
          padding: 16px 14px 14px;
          margin-bottom: 22px;
          text-align: center;
        }
        .sidebar-card-avatars {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
          position: relative;
          height: 40px;
        }
        .sb-av {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: ${SB_PINK_SOFT};
          border: 2px solid #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          font-weight: 800;
          color: ${SB_PINK};
          overflow: hidden;
          flex-shrink: 0;
        }
        .sb-av img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .sb-av-1 { z-index: 1; }
        .sb-av-2 {
          margin-left: -14px;
          z-index: 0;
        }
        .sb-heart-wrap {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 2;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #fff;
          border: 1px solid ${SB_BORDER};
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sidebar-card-kicker {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: ${SB_MUTED};
          margin: 0 0 4px;
        }
        .sidebar-card-num {
          font-family: var(--font-display);
          font-size: 32px;
          font-weight: 900;
          line-height: 1;
          color: ${SB_TEXT};
          margin: 0 0 6px;
        }
        .sidebar-card-since {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: ${SB_MUTED};
          margin: 0;
        }

        .sidebar-section-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: ${SB_MUTED};
          margin: 0 0 10px 8px;
        }

        .sidebar-nav-block {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 4px;
        }

        .sb-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 10px;
          border-radius: 12px;
          text-decoration: none;
          transition: background 0.15s ease;
        }
        .sb-link:hover {
          background: ${SB_PINK_SOFT};
        }
        .sb-link-active {
          background: ${SB_PINK_SOFT};
        }
        .sb-ico-wrap {
          width: 40px;
          height: 40px;
          border-radius: 11px;
          background: ${SB_ICON_BG};
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.15s ease, box-shadow 0.15s ease;
        }
        .sb-ico-wrap-active {
          background: ${SB_PINK};
          box-shadow: 0 4px 12px ${SB_PINK_SOFT};
        }
        .sb-link-label {
          flex: 1;
          font-size: 14px;
          font-weight: 600;
          color: ${SB_TEXT};
        }
        .sb-link-active .sb-link-label {
          font-weight: 700;
        }
        .sb-badge {
          min-width: 22px;
          height: 22px;
          padding: 0 6px;
          border-radius: 999px;
          background: ${SB_PINK};
          color: #fff;
          font-size: 11px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .sb-badge-spacer {
          min-width: 22px;
          flex-shrink: 0;
        }

        .sidebar-rule {
          height: 1px;
          background: ${SB_BORDER};
          margin: 16px 8px 18px;
        }
        .sidebar-rule-footer {
          margin-bottom: 16px;
        }

        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 6px 0;
        }
        .sidebar-user-av {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: ${SB_PINK_SOFT};
          color: ${SB_PINK};
          font-weight: 800;
          font-size: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
          border: 2px solid #fff;
          box-shadow: 0 0 0 1px ${SB_BORDER};
        }
        .sidebar-user-av img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .sidebar-user-text {
          flex: 1;
          min-width: 0;
        }
        .sidebar-user-name {
          font-size: 13px;
          font-weight: 700;
          color: ${SB_TEXT};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sidebar-user-email {
          font-size: 11px;
          color: ${SB_MUTED};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sidebar-user-actions {
          display: flex;
          gap: 6px;
          flex-shrink: 0;
        }
        .sb-icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid ${SB_BORDER};
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          text-decoration: none;
          color: inherit;
          transition: border-color 0.15s, background 0.15s;
        }
        .sb-icon-btn:hover {
          border-color: ${SB_PINK};
          background: ${SB_PINK_SOFT};
        }

        .mobile-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 50;
          background: #ffffff;
          border-top: 1px solid ${SB_BORDER};
          padding: 8px 0 max(8px, env(safe-area-inset-bottom));
        }
        @media (max-width: 768px) {
          .mobile-nav {
            display: flex;
            justify-content: space-around;
          }
        }

        .mobile-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          text-decoration: none;
          color: ${SB_MUTED};
          padding: 4px 8px;
          border-radius: var(--radius-sm);
        }
        .mobile-nav-active .mobile-nav-label {
          color: ${SB_PINK};
          font-weight: 700;
        }
        .mobile-nav-label {
          font-size: 10px;
          font-weight: 500;
        }
      `}</style>
    </>
  );
}
