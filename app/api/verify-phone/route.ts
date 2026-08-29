import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { phoneVerified: true },
    select: { id: true, email: true, phoneVerified: true },
  });

  return NextResponse.json({ user, phoneVerified: true });
}
