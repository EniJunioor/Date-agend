import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// PATCH /api/notifications/read-all
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.userId, session.user.id));

  return NextResponse.json({ success: true });
}
