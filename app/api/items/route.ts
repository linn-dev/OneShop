import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ITEM_CATEGORIES, normalizeCategory } from "@/lib/categories";
import { getCurrentUser } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to list an item." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
  const priceRaw = body.price ?? body.suggestedPrice;
  const price = typeof priceRaw === "number" ? priceRaw : Number.parseFloat(String(priceRaw ?? ""));
  const category = normalizeCategory(body.category);
  const lat = typeof body.lat === "number" ? body.lat : undefined;
  const lng = typeof body.lng === "number" ? body.lng : undefined;

  if (!title || !description) {
    return NextResponse.json({ error: "Title and description are required." }, { status: 400 });
  }
  if (!imageUrl.startsWith("/uploads/")) {
    return NextResponse.json({ error: "A locally uploaded image is required." }, { status: 400 });
  }
  if (!Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ error: "Enter a valid price." }, { status: 400 });
  }
  if (!ITEM_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Pick a valid category." }, { status: 400 });
  }

  const item = await prisma.item.create({
    data: {
      title,
      description,
      price,
      category,
      imageUrl,
      status: "available",
      lat: lat ?? null,
      lng: lng ?? null,
      userId: user.id,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
