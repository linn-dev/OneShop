import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { Shield } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MessageSeller } from "@/components/message-seller";
import { SellerTrustBadge } from "@/components/seller-trust-badge";

export default async function ItemPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const item = await prisma.item.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phoneVerified: true,
          rating: true,
          dealsDone: true,
        },
      },
    },
  });

  if (!item) notFound();

  const isOwner = session?.user?.id === item.userId;
  const sold = item.status === "sold";

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-2">
      <div>
        <div className="relative overflow-hidden rounded-3xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt={item.title}
            className="aspect-[4/3] w-full object-cover"
          />
          {sold && (
            <span className="pointer-events-none absolute left-0 top-6 w-40 -translate-x-8 -rotate-45 bg-emerald-100 py-1 text-center text-xs font-semibold uppercase tracking-wide text-emerald-800 shadow-sm">
              Sold
            </span>
          )}
        </div>
        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-zinc-400">
          {item.category}
          {item.status !== "available" ? ` · ${item.status}` : ""}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{item.title}</h1>
        <p className="mt-1 text-xl font-medium">${item.price.toFixed(2)}</p>
        <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-600">
          {item.description}
        </p>
      </div>

      <aside className="space-y-3 sm:sticky sm:top-20 sm:self-start">
        <SellerTrustBadge seller={item.user} />
        <p className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-xs font-medium text-emerald-900">
          <Shield className="size-3.5 shrink-0 text-emerald-700" aria-hidden />
          Meet in public · Never share your home address
        </p>
        <MessageSeller itemId={item.id} isOwner={isOwner} itemStatus={item.status} />
      </aside>
    </div>
  );
}
