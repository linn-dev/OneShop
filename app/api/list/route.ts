import { NextResponse } from "next/server";
import { generateListingFromImage } from "@/lib/listing-ai";
import { getCurrentUser } from "@/lib/session";
import { isAllowedImage, saveLocalUpload } from "@/lib/uploads";

export const runtime = "nodejs";
export const maxDuration = 60;

async function resolveImageUrl(request: Request): Promise<string | NextResponse> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const existing = form.get("imageUrl");
    if (typeof existing === "string" && existing.startsWith("/uploads/")) {
      return existing;
    }
    const file = form.get("image");
    if (!(file instanceof File) || !isAllowedImage(file)) {
      return NextResponse.json(
        { error: "Upload a JPEG, PNG, WebP, or GIF under 8MB." },
        { status: 400 },
      );
    }
    const saved = await saveLocalUpload(file);
    return saved.imageUrl;
  }

  const body = (await request.json().catch(() => null)) as { imageUrl?: string } | null;
  if (!body?.imageUrl?.startsWith("/uploads/")) {
    return NextResponse.json(
      { error: "Pass imageUrl from /api/upload, or upload the image here." },
      { status: 400 },
    );
  }
  return body.imageUrl;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to generate a listing." }, { status: 401 });
  }

  const imageUrlOrError = await resolveImageUrl(request);
  if (imageUrlOrError instanceof NextResponse) return imageUrlOrError;
  const imageUrl = imageUrlOrError;

  try {
    const { listing, provider } = await generateListingFromImage(imageUrl);
    return NextResponse.json({
      title: listing.title,
      description: listing.description,
      category: listing.category,
      suggestedPrice: listing.suggestedPrice,
      imageUrl,
      provider,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not generate listing.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
