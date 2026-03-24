import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { timeCapsules, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { CapsulesClient } from "@/components/shared/CapsulesClient";

export const metadata: Metadata = { title: "Cápsulas do Tempo" };

export default async function CapsulesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!session.user.coupleId) redirect("/invite");

  const coupleId = session.user.coupleId;

  const capsules = await db
    .select({
      id: timeCapsules.id,
      title: timeCapsules.title,
      content: timeCapsules.content,
      openAt: timeCapsules.openAt,
      openedAt: timeCapsules.openedAt,
      createdAt: timeCapsules.createdAt,
      createdById: timeCapsules.createdById,
    })
    .from(timeCapsules)
    .where(eq(timeCapsules.coupleId, coupleId))
    .orderBy(desc(timeCapsules.createdAt));

  return (
    <CapsulesClient
      capsules={capsules}
      userId={session.user.id}
      coupleId={coupleId}
    />
  );
}
