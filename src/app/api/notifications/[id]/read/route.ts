import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// PATCH /api/notifications/[id]/read
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  await db
    .update(notifications)
    .set({ read: true })
    .where(
      and(
        eq(notifications.id, params.id),
        eq(notifications.userId, session.user.id)
      )
    );

  return NextResponse.json({ success: true });
}
