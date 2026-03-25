import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import { db } from "@/lib/db";
import { photos } from "@/lib/db/schema";
import { uploadRatelimit } from "@/lib/utils/ratelimit";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session.user.coupleId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // Rate limiting per user (opcional — exige Upstash válido em .env)
  if (uploadRatelimit) {
    try {
      const { success } = await uploadRatelimit.limit(session.user.id);
      if (!success) {
        return NextResponse.json(
          { error: "Limite de upload atingido. Tente novamente em 1 hora." },
          { status: 429 }
        );
      }
    } catch (err) {
      console.error("Upload rate limit indisponível (fail-open):", err);
    }
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const eventId = formData.get("eventId") as string | null;
  const caption = formData.get("caption") as string | null;

  if (!file || !eventId) {
    return NextResponse.json({ error: "Arquivo e evento são obrigatórios." }, { status: 400 });
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Tipo de arquivo não suportado. Use JPG, PNG, WEBP ou GIF." },
      { status: 400 }
    );
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Arquivo muito grande. Máximo 10MB." },
      { status: 400 }
    );
  }

  // Convert to buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Upload to Cloudinary
  const uploadResult = await new Promise<{
    public_id: string;
    secure_url: string;
    width: number;
    height: number;
  }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: `calendario-do-casal/${session.user.coupleId}`,
          resource_type: "image",
          transformation: [
            { quality: "auto:good", fetch_format: "auto" },
            { width: 2000, height: 2000, crop: "limit" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as any);
        }
      )
      .end(buffer);
  });

  // Save to database
  const [photo] = await db
    .insert(photos)
    .values({
      eventId,
      coupleId: session.user.coupleId,
      uploadedById: session.user.id,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      caption: caption ?? null,
    })
    .returning({ id: photos.id, url: photos.url });

  return NextResponse.json({ success: true, photo });
}
