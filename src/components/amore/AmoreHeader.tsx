"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppIcon } from "@/components/ui/app-icon";

const titles: Record<string, { kicker: string; title: string }> = {
  "/dashboard": { kicker: "The Emotional Archive", title: "Dashboard" },
  "/timeline": { kicker: "The Emotional Archive", title: "The Chapters of Us" },
  "/gallery": { kicker: "The Emotional Archive", title: "Captured Moments" },
  "/calendar": { kicker: "The Emotional Archive", title: "Calendar" },
  "/achievements": { kicker: "The Emotional Archive", title: "Our Milestones" },
  "/settings": { kicker: "The Emotional Archive", title: "Settings" },
};

function resolveTitle(pathname: string) {
  const hit = Object.entries(titles).find(
    ([k]) => pathname === k || pathname.startsWith(k + "/")
  )?.[1];
  return hit ?? { kicker: "The Emotional Archive", title: "Amore Moderno" };
}

export function AmoreHeader() {
  const pathname = usePathname();
  const { kicker, title } = resolveTitle(pathname);

  return (
    <header className="amore-header">
      <div className="amore-header-left">
        <div className="amore-header-kicker">{kicker}</div>
        <div className="amore-header-title">{title}</div>
      </div>

      <div className="amore-header-right">
        <Link className="amore-icon-btn" href="/notifications" aria-label="Notifications">
          <AppIcon name="bell" size={18} />
        </Link>
        <Link className="amore-icon-btn" href="/favorites" aria-label="Favorites">
          <AppIcon name="heart" size={18} />
        </Link>
        <Link className="amore-icon-btn" href="/settings" aria-label="Account">
          <AppIcon name="user" size={18} />
        </Link>
      </div>
    </header>
  );
}

