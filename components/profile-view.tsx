"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import ChatPanel from "@/components/chat-panel";
import { ListingImage } from "@/components/listing-image";
import { SellerTrustBadge } from "@/components/seller-trust-badge";
import { cn } from "@/lib/utils";
import type { SellerTrust } from "@/lib/trust";

export type ProfileItem = {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  category: string;
  status: string;
};

export type InboxConversation = {
  id: string;
  buyerId: string;
  sellerId: string;
  itemId: string;
  role: "seller" | "buyer";
  item: {
    id: string;
    title: string;
    imageUrl: string;
    price: number;
    status: string;
  };
  otherParty: { id: string; name: string | null; email: string };
  lastMessage: { id: string; text: string; createdAt: string; senderId: string } | null;
  messageCount: number;
};

export function ProfileView({
  user,
  items,
}: {
  user: SellerTrust;
  items: ProfileItem[];
}) {
  const [conversations, setConversations] = useState<InboxConversation[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | "all">(
    items[0]?.id ?? "all",
  );
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [loadingInbox, setLoadingInbox] = useState(true);

  const loadInbox = useCallback(async () => {
    const res = await fetch("/api/conversations");
    if (!res.ok) {
      setConversations([]);
      return;
    }
    const data = (await res.json()) as { conversations?: InboxConversation[] };
    setConversations(data.conversations ?? []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadingInbox(true);
    loadInbox().finally(() => {
      if (!cancelled) setLoadingInbox(false);
    });
    return () => {
      cancelled = true;
    };
  }, [loadInbox]);

  const countsByItem = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of conversations) {
      map.set(c.itemId, (map.get(c.itemId) ?? 0) + 1);
    }
    return map;
  }, [conversations]);

  const visibleConversations = useMemo(() => {
    if (selectedItemId === "all") return conversations;
    return conversations.filter((c) => c.itemId === selectedItemId);
  }, [conversations, selectedItemId]);

  useEffect(() => {
    if (visibleConversations.length === 0) {
      setSelectedConversationId(null);
      return;
    }
    setSelectedConversationId((current) => {
      if (current && visibleConversations.some((c) => c.id === current)) {
        return current;
      }
      return visibleConversations[0].id;
    });
  }, [visibleConversations]);

  const selectedConversation =
    visibleConversations.find((c) => c.id === selectedConversationId) ?? null;
  const selectedItem =
    selectedItemId === "all"
      ? null
      : items.find((item) => item.id === selectedItemId) ?? null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Account
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Your profile</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Your listings and the messages tied to them.
        </p>
      </div>

      <SellerTrustBadge seller={user} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
        <section>
          <div className="mb-3 flex items-end justify-between gap-2">
            <h2 className="font-medium">Your products</h2>
            <Link href="/sell" className="text-xs font-medium text-emerald-800 hover:underline">
              List an item
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
              You have not listed anything yet.{" "}
              <Link href="/sell" className="font-medium text-zinc-900 underline">
                Sell something
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => setSelectedItemId("all")}
                  className={cn(
                    "w-full rounded-2xl border px-3 py-2.5 text-left text-sm transition",
                    selectedItemId === "all"
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-zinc-200 bg-white hover:border-emerald-100",
                  )}
                >
                  All messages
                  <span className="ml-2 text-xs text-zinc-500">{conversations.length}</span>
                </button>
              </li>
              {items.map((item) => {
                const threadCount = countsByItem.get(item.id) ?? 0;
                const sold = item.status === "sold";
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedItemId(item.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl border p-2 text-left transition",
                        selectedItemId === item.id
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-zinc-200 bg-white hover:border-emerald-100",
                      )}
                    >
                      <ListingImage
                        src={item.imageUrl}
                        alt=""
                        className="size-14 shrink-0 rounded-xl"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{item.title}</span>
                        <span className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
                          ${item.price.toFixed(2)}
                          {sold && (
                            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 font-medium text-emerald-800">
                              Sold
                            </span>
                          )}
                          <span>
                            {threadCount} {threadCount === 1 ? "chat" : "chats"}
                          </span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="space-y-3 lg:sticky lg:top-20 lg:self-start">
          <div>
            <h2 className="font-medium">Messages</h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              {selectedItem ? (
                <>
                  Chats about {selectedItem.title}
                  {" · "}
                  <Link
                    href={`/item/${selectedItem.id}`}
                    className="font-medium text-zinc-800 hover:underline"
                  >
                    View listing
                  </Link>
                </>
              ) : (
                "All conversations for your listings and purchases."
              )}
            </p>
          </div>

          {loadingInbox ? (
            <div className="rounded-2xl border border-zinc-200 p-4 text-sm text-zinc-500">
              Loading messages…
            </div>
          ) : visibleConversations.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
              {selectedItem
                ? "No one has messaged you about this listing yet."
                : "No messages yet. When a buyer writes about one of your items, it will show up here."}
            </div>
          ) : (
            <>
              {visibleConversations.length > 1 && (
                <ul className="flex gap-2 overflow-x-auto pb-1">
                  {visibleConversations.map((c) => {
                    const label = c.otherParty.name || c.otherParty.email;
                    const active = c.id === selectedConversationId;
                    return (
                      <li key={c.id} className="shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedConversationId(c.id)}
                          className={cn(
                            "max-w-[14rem] rounded-full border px-3 py-1.5 text-left text-xs transition",
                            active
                              ? "border-emerald-300 bg-emerald-50 font-medium text-emerald-950"
                              : "border-zinc-200 bg-white text-zinc-700 hover:border-emerald-100",
                          )}
                        >
                          <span className="block truncate">{label}</span>
                          {selectedItemId === "all" && (
                            <span className="block truncate text-[10px] text-zinc-500">
                              {c.item.title}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {selectedConversation && (
                <ChatPanel
                  key={selectedConversation.id}
                  itemId={selectedConversation.itemId}
                  conversationId={selectedConversation.id}
                  isOwner={selectedConversation.role === "seller"}
                  initialStatus={
                    selectedItem?.status ?? selectedConversation.item.status
                  }
                />
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
