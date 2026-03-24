import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, couples } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { SettingsClient } from "@/components/shared/SettingsClient";

export const metadata: Metadata = { title: "Configurações" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      nickname: users.nickname,
      locale: users.locale,
      coupleId: users.coupleId,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  let couple = null;
  if (user?.coupleId) {
    const [c] = await db
      .select({ id: couples.id, theme: couples.theme, bio: couples.bio, phrase: couples.phrase, startDate: couples.startDate })
      .from(couples)
      .where(eq(couples.id, user.coupleId))
      .limit(1);
    couple = c;
  }

  return <SettingsClient user={user} couple={couple} />;
}
