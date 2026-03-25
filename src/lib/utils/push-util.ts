// src/lib/utils/push.ts
// npm install web-push
// npm install -D @types/web-push

import webpush from "web-push";
import { db } from "@/lib/db";
import { pushSubscriptions, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

webpush.setVapidDetails(
  "mailto:suporte@calendariodocasal.com",
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  image?: string;
  tag?: string;
}

export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<number> {
  const subs = await db.query.pushSubscriptions.findMany({
    where: eq(pushSubscriptions.userId, userId),
  });

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload)
      )
    )
  );

  // Remove subscriptions inválidas (expiradas/revogadas)
  let delivered = 0;
  results.forEach((result, i) => {
    if (result.status === "fulfilled") delivered++;
    if (
      result.status === "rejected" &&
      (result.reason?.statusCode === 410 || result.reason?.statusCode === 404)
    ) {
      db.delete(pushSubscriptions)
        .where(eq(pushSubscriptions.id, subs[i].id))
        .catch(console.error);
    }
  });

  return delivered;
}

/**
 * Envia push para ambos os parceiros do casal
 */
export async function sendPushToCouple(coupleId: string, payload: PushPayload) {
  const coupleUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.coupleId, coupleId));

  await Promise.allSettled(coupleUsers.map((u) => sendPushToUser(u.id, payload)));
}
