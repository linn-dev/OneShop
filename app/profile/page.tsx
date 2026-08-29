import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileView } from "@/components/profile-view";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/profile");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phoneVerified: true,
      rating: true,
      dealsDone: true,
    },
  });

  if (!user) {
    redirect("/login?callbackUrl=/profile");
  }

  const items = await prisma.item.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      price: true,
      imageUrl: true,
      category: true,
      status: true,
    },
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <ProfileView user={user} items={items} />
    </main>
  );
}
