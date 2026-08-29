import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { isAllowedImage, saveLocalUpload } from "@/lib/uploads";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to upload photos." }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("image");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  }
  if (!isAllowedImage(file)) {
    return NextResponse.json(
      { error: "Use a JPEG, PNG, WebP, or GIF under 8MB." },
      { status: 400 },
    );
  }

  try {
    const saved = await saveLocalUpload(file);
    return NextResponse.json({ imageUrl: saved.imageUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
