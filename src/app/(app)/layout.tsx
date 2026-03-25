import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { AppHeader } from "@/components/shared/AppHeader";
import { db } from "@/lib/db";
import { users, couples, photos } from "@/lib/db/schema";
import { and, count, eq, gte } from "drizzle-orm";
import { subDays } from "date-fns";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Fetch user and couple data
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      coupleId: users.coupleId,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  let couple = null;
  let partner: { name: string; image: string | null } | null = null;
  let galleryRecentPhotoCount = 0;

  if (user?.coupleId) {
    const [coupleData] = await db
      .select()
      .from(couples)
      .where(eq(couples.id, user.coupleId))
      .limit(1);
    couple = coupleData;

    const members = await db
      .select({ id: users.id, name: users.name, image: users.image })
      .from(users)
      .where(eq(users.coupleId, user.coupleId));

    const other = members.find((m) => m.id !== user.id);
    if (other) {
      partner = { name: other.name ?? "", image: other.image };
    }

    const since = subDays(new Date(), 14);
    const [photoRow] = await db
      .select({ c: count() })
      .from(photos)
      .where(
        and(eq(photos.coupleId, user.coupleId), gte(photos.createdAt, since))
      );
    galleryRecentPhotoCount = Number(photoRow?.c ?? 0);
  }

  // If no couple, redirect to couple setup
  if (!user?.coupleId) {
    const allowedWithoutCouple = ["/settings", "/verify-email"];
    // Allow going through — the page itself can handle the redirect
  }

  return (
    <div className="app-shell">
      <AppSidebar
        user={user}
        couple={couple}
        partner={partner}
        galleryRecentPhotoCount={galleryRecentPhotoCount}
      />
      <div className="app-main">
        <AppHeader user={user} />
        <main className="app-content">{children}</main>
      </div>

      <style>{`
        .app-shell {
          display: flex;
          min-height: 100vh;
          background: var(--background-subtle);
        }
        .app-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow: hidden;
        }
        .app-content {
          flex: 1;
          padding: 28px;
          overflow-y: auto;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
        }
        @media (max-width: 768px) {
          .app-content { padding: 16px; }
        }
      `}</style>
    </div>
  );
}
