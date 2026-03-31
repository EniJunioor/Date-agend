"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { AppIcon } from "@/components/ui/app-icon";

type NavItem = { href: string; label: string; icon: string };

const nav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "home" },
  { href: "/calendar", label: "Calendar", icon: "calendar" },
  { href: "/timeline", label: "Timeline", icon: "activity" },
  { href: "/gallery", label: "Gallery", icon: "image" },
  { href: "/achievements", label: "Achievements", icon: "star" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function AmoreSidebar({
  user,
}: {
  user:
    | {
        name: string;
        email: string;
        image: string | null;
      }
    | undefined;
}) {
  const pathname = usePathname();

  return (
    <aside className="amore-sidebar" aria-label="Sidebar">
      <div className="amore-brand">
        <div className="amore-brand-title">Amore Moderno</div>
        <div className="amore-brand-sub">The Emotional Archive</div>
      </div>

      <div className="amore-search">
        <span className="amore-search-ic" aria-hidden="true">
          <AppIcon name="search" size={16} />
        </span>
        <input placeholder="Search memories..." />
      </div>

      <nav className="amore-nav">
        {nav.map((i) => {
          const active = isActive(pathname, i.href);
          return (
            <Link key={i.href} href={i.href} className={active ? "is-active" : ""}>
              <span className="amore-nav-ic" aria-hidden="true">
                <AppIcon name={i.icon as any} size={18} />
              </span>
              {i.label}
            </Link>
          );
        })}
      </nav>

      <div className="amore-add">
        <a href="/calendar" className="amore-add-link">+ Add Memory</a>
      </div>

      <div className="amore-profile">
        <div className="amore-profile-left">
          <div className="amore-avatar" aria-hidden="true">
            {user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt=""
                width={34}
                height={34}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span>{user?.name?.[0]?.toUpperCase() ?? "?"}</span>
            )}
          </div>
          <div className="amore-profile-meta">
            <div className="amore-profile-name">{user?.name ?? "—"}</div>
            <div className="amore-profile-sub">{user?.email ?? ""}</div>
          </div>
        </div>

        <div className="amore-profile-actions">
          <Link className="amore-icon-btn" href="/settings" aria-label="Settings">
            <AppIcon name="settings" size={18} />
          </Link>
          <form action={logoutAction}>
            <button className="amore-icon-btn" type="submit" aria-label="Logout">
              <AppIcon name="log-out" size={18} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

