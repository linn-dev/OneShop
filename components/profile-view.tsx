"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, MessageCircle, X } from "lucide-react";
import ChatPanel from "@/components/chat-panel";
import { ItemCard } from "@/components/item-card";
import { SellerTrustBadge } from "@/components/seller-trust-badge";
import { UserAvatar } from "@/components/user-avatar";
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
  const [inboxOpen, setInboxOpen] = useState(false);
  const [filterItemId, setFilterItemId] = useState<string | "all">("all");
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

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setInboxOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const countsByItem = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of conversations) {
      map.set(c.itemId, (map.get(c.itemId) ?? 0) + 1);
    }
    return map;
  }, [conversations]);

  const visibleConversations = useMemo(() => {
    if (filterItemId === "all") return conversations;
    return conversations.filter((c) => c.itemId === filterItemId);
  }, [conversations, filterItemId]);

  const selectedConversation =
    visibleConversations.find((c) => c.id === selectedConversationId) ?? null;

  function openInbox(itemId: string | "all" = "all") {
    setFilterItemId(itemId);
    setSelectedConversationId(null);
    setInboxOpen(true);
  }

  const filterLabel =
    filterItemId === "all"
      ? null
      : items.find((item) => item.id === filterItemId)?.title ??
        visibleConversations[0]?.item.title ??
        null;

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <UserAvatar
          src={user.image}
          alt={user.name || user.email}
          size="xl"
          className="ring-2 ring-emerald-100"
        />
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Account
          </p>
          <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight">
            {user.name || "Your profile"}
          </h1>
          <p className="mt-1 truncate text-sm text-zinc-500">{user.email}</p>
        </div>
      </div>

      <SellerTrustBadge seller={user} showAvatar={false} />

      <section>
        <div className="mb-4 flex items-end justify-between gap-2">
          <h2 className="text-xl font-semibold tracking-tight">Your products</h2>
          <Link href="/sell" className="text-sm font-medium text-emerald-800 hover:underline">
            List an item
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center text-sm text-zinc-600">
            You have not listed anything yet.{" "}
            <Link href="/sell" className="font-medium text-zinc-900 underline">
              Sell something
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const threadCount = countsByItem.get(item.id) ?? 0;
              const sold = item.status === "sold";
              return (
                <li key={item.id} className="relative">
                  <ItemCard
                    item={{
                      id: item.id,
                      title: item.title,
                      price: item.price,
                      imageUrl: item.imageUrl,
                      category: item.category,
                      user: {
                        name: user.name,
                        email: user.email,
                        rating: user.rating,
                      },
                    }}
                  />
                  {sold && (
                    <span className="pointer-events-none absolute left-0 top-6 z-10 w-36 -translate-x-6 -rotate-45 bg-emerald-100 py-0.5 text-center text-[10px] font-semibold uppercase tracking-wide text-emerald-800 shadow-sm">
                      Sold
                    </span>
                  )}
                  {threadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => openInbox(item.id)}
                      className="absolute right-3 top-3 z-10 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-emerald-900 shadow-sm ring-1 ring-emerald-100 hover:bg-emerald-50"
                    >
                      {threadCount} {threadCount === 1 ? "chat" : "chats"}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <button
        type="button"
        onClick={() => (inboxOpen ? setInboxOpen(false) : openInbox("all"))}
        className="fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-700"
        aria-expanded={inboxOpen}
        aria-controls="profile-messages"
        aria-label={inboxOpen ? "Close messages" : "Open messages"}
      >
        {inboxOpen ? <X className="size-6" /> : <MessageCircle className="size-6" />}
        {!inboxOpen && conversations.length > 0 && (
          <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-emerald-950">
            {conversations.length > 9 ? "9+" : conversations.length}
          </span>
        )}
      </button>

      {inboxOpen && (
        <div
          id="profile-messages"
          role="dialog"
          aria-label="Messages"
          className="fixed bottom-24 right-4 z-40 flex h-[min(34rem,calc(100vh-8rem))] w-[min(26rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-2xl shadow-emerald-950/10"
        >
          <div className="flex items-start justify-between gap-2 border-b border-emerald-100 px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                {selectedConversation && (
                  <button
                    type="button"
                    onClick={() => setSelectedConversationId(null)}
                    className="rounded-full p-1 text-zinc-500 hover:bg-zinc-100"
                    aria-label="Back to conversations"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                )}
                <h2 className="font-medium">Messages</h2>
              </div>
              <p className="mt-0.5 truncate text-xs text-zinc-500">
                {selectedConversation
                  ? selectedConversation.otherParty.name || selectedConversation.otherParty.email
                  : filterLabel
                    ? `Chats about ${filterLabel}`
                    : "Your listing and purchase chats"}
              </p>
            </div>
            {filterItemId !== "all" && !selectedConversation && (
              <button
                type="button"
                onClick={() => setFilterItemId("all")}
                className="shrink-0 text-xs font-medium text-emerald-800 hover:underline"
              >
                All chats
              </button>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {loadingInbox ? (
              <p className="p-4 text-sm text-zinc-500">Loading messages…</p>
            ) : selectedConversation ? (
              <div className="p-3">
                <p className="mb-2 truncate px-1 text-xs text-zinc-500">
                  {selectedConversation.item.title}
                  {" · "}
                  <Link
                    href={`/item/${selectedConversation.itemId}`}
                    className="font-medium text-zinc-800 hover:underline"
                  >
                    View listing
                  </Link>
                </p>
                <ChatPanel
                  key={selectedConversation.id}
                  itemId={selectedConversation.itemId}
                  conversationId={selectedConversation.id}
                  isOwner={selectedConversation.role === "seller"}
                  initialStatus={selectedConversation.item.status}
                />
              </div>
            ) : visibleConversations.length === 0 ? (
              <p className="p-4 text-sm text-zinc-600">
                {filterItemId === "all"
                  ? "No messages yet. When a buyer writes about one of your items, it will show up here."
                  : "No one has messaged you about this listing yet."}
              </p>
            ) : (
              <ul>
                {visibleConversations.map((c) => {
                  const label = c.otherParty.name || c.otherParty.email;
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedConversationId(c.id)}
                        className="flex w-full gap-3 px-4 py-3 text-left hover:bg-emerald-50/80"
                      >
                        <UserAvatar alt={label} size="md" />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-medium">{label}</span>
                            <span className="shrink-0 text-[10px] text-zinc-400">
                              {c.messageCount} {c.messageCount === 1 ? "msg" : "msgs"}
                            </span>
                          </span>
                          <span className="block truncate text-xs text-zinc-500">{c.item.title}</span>
                          {c.lastMessage && (
                            <span className="mt-0.5 block truncate text-xs text-zinc-400">
                              {c.lastMessage.text}
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
