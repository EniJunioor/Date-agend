import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { timeCapsules } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session.user.coupleId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { title, content, openAt, coupleId } = await req.json();

  if (!title || !content || !openAt) {
    return NextResponse.json({ error: "Campos obrigatórios ausentes." }, { status: 400 });
  }

  const openAtDate = new Date(openAt);
  if (openAtDate <= new Date()) {
    return NextResponse.json({ error: "A data de abertura deve ser no futuro." }, { status: 400 });
  }

  // Ensure user belongs to this couple
  if (coupleId !== session.user.coupleId) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const [capsule] = await db
    .insert(timeCapsules)
    .values({
      coupleId: session.user.coupleId,
      createdById: session.user.id,
      title,
      content,
      openAt: openAtDate,
    })
    .returning({ id: timeCapsules.id });

  return NextResponse.json({ success: true, capsule });
}
