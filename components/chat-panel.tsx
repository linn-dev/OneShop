"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PUBLIC_MEETUP_PLACES,
  safeMeetupTemplate,
  type PublicMeetupPlace,
} from "@/lib/meetup";

type ChatMessage = {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
  sender: { id: string; name: string | null; email: string };
};

export default function ChatPanel({
  itemId,
  isOwner,
  initialStatus = "available",
}: {
  itemId: string;
  isOwner: boolean;
  initialStatus?: string;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [itemStatus, setItemStatus] = useState(initialStatus);
  const [place, setPlace] = useState<PublicMeetupPlace>(PUBLIC_MEETUP_PLACES[0]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [selling, setSelling] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const sold = itemStatus === "sold";

  const load = useCallback(async () => {
    const res = await fetch(`/api/chat?itemId=${encodeURIComponent(itemId)}`);
    if (res.status === 401) return;
    const data = await res.json();
    setMessages(data.messages ?? []);
    if (data.item?.status) setItemStatus(data.item.status);
  }, [itemId]);

  useEffect(() => {
    if (status === "authenticated") {
      load();
    }
  }, [status, load]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  async function sendMessage(body: string) {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, text: body }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Could not send.");
    }
    if (data.message) {
      setMessages((prev) => [...prev, data.message]);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      await sendMessage(text);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send.");
    } finally {
      setPending(false);
    }
  }

  async function sendMeetupSuggestion() {
    if (sold || pending) return;
    setError("");
    setPending(true);
    try {
      await sendMessage(safeMeetupTemplate(place));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send.");
    } finally {
      setPending(false);
    }
  }

  async function markAsSold() {
    setError("");
    setSelling(true);
    try {
      const res = await fetch(`/api/items/${encodeURIComponent(itemId)}/sold`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not mark as sold.");
        return;
      }
      setItemStatus(data.item?.status ?? "sold");
      router.refresh();
    } finally {
      setSelling(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="rounded-2xl border border-zinc-200 p-4 text-sm text-zinc-500">
        Loading chat…
      </div>
    );
  }

  if (!session) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
        <h2 className="font-medium">Chat with seller</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Sign in to message about this listing.
        </p>
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(`/item/${itemId}`)}`}
          className="mt-3 inline-block rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white"
        >
          Sign in to chat
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-2xl border border-zinc-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-medium">
            {isOwner ? "Conversation" : "Chat with seller"}
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            {sold
              ? "This listing is sold."
              : "Arrange a public meetup. Never share your home address."}
          </p>
        </div>
        {isOwner && (
          <Button
            type="button"
            size="sm"
            variant={sold ? "secondary" : "outline"}
            disabled={sold || selling}
            onClick={markAsSold}
          >
            {sold ? "Sold" : selling ? "Marking…" : "Mark as sold"}
          </Button>
        )}
      </div>

      <div
        ref={listRef}
        className="mt-3 max-h-72 min-h-40 space-y-2 overflow-y-auto rounded-lg bg-zinc-50 p-3"
      >
        {messages.length === 0 ? (
          <p className="text-sm text-zinc-500">
            {isOwner
              ? "No messages yet."
              : "Say hello and suggest a public meetup."}
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === session.user.id;
            return (
              <div
                key={m.id}
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm",
                  mine
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "border border-zinc-200 bg-white text-zinc-800 shadow-sm",
                )}
              >
                <p>{m.text}</p>
                <p
                  className={cn(
                    "mt-1 text-[10px]",
                    mine ? "text-primary-foreground/70" : "text-zinc-400",
                  )}
                >
                  {m.sender.name || m.sender.email}
                </p>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-3 space-y-2">
        <label className="block text-xs font-medium text-zinc-500">
          Meetup place
          <select
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-zinc-900"
            value={place}
            onChange={(e) => setPlace(e.target.value as PublicMeetupPlace)}
            disabled={sold}
          >
            {PUBLIC_MEETUP_PLACES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={sold || pending}
          onClick={() => void sendMeetupSuggestion()}
          className="flex w-full items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-3 py-2.5 text-left transition hover:bg-emerald-50 disabled:opacity-60"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
            <MapPin className="size-4" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium capitalize text-emerald-950">{place}</span>
            <span className="block text-xs text-emerald-800/80">
              {pending ? "Sending…" : "Tap to send"}
            </span>
          </span>
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-3 flex gap-2">
        <textarea
          className="min-h-10 flex-1 resize-y rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a message"
          rows={2}
          required
          disabled={sold}
        />
        <button
          type="submit"
          disabled={pending || sold}
          className="self-end rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          Send
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
