import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import "@/styles/amore-app.css";
import { AmoreSidebar } from "@/components/amore/AmoreSidebar";
import { AmoreHeader } from "@/components/amore/AmoreHeader";
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
    <div className="amore-app">
      <div className="amore-shell">
        <AmoreSidebar user={user} />
        <div className="amore-main">
          <AmoreHeader />
          <main className="amore-content">{children}</main>
        </div>
      </div>
    </div>
  );
}
