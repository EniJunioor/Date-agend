import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { notifications, notificationSettings, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { NotificationsClient } from "@/components/shared/NotificationsClient";

export const metadata: Metadata = { title: "Notificações" };

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [allNotifications, settings] = await Promise.all([
    db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50),
    db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.userId, userId))
      .limit(1),
  ]);

  return (
    <NotificationsClient
      notifications={allNotifications}
      settings={settings[0] ?? null}
      userId={userId}
    />
  );
}
