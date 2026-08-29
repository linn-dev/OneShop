"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { FormEvent, useCallback, useEffect, useState } from "react";

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
}: {
  itemId: string;
  isOwner: boolean;
}) {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/chat?itemId=${encodeURIComponent(itemId)}`);
    if (res.status === 401) return;
    const data = await res.json();
    setMessages(data.messages ?? []);
  }, [itemId]);

  useEffect(() => {
    if (status === "authenticated") {
      load();
    }
  }, [status, load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not send.");
        return;
      }
      setText("");
      setMessages((prev) => [...prev, data.message]);
    } finally {
      setPending(false);
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
    <div className="rounded-2xl border border-zinc-200 p-4">
      <h2 className="font-medium">
        {isOwner ? "Messages from buyers" : "Chat with seller"}
      </h2>
      <div className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded-lg bg-zinc-50 p-3">
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
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  mine
                    ? "ml-auto bg-zinc-900 text-white"
                    : "bg-white text-zinc-800 shadow-sm"
                }`}
              >
                <p>{m.text}</p>
                <p className={`mt-1 text-[10px] ${mine ? "text-zinc-300" : "text-zinc-400"}`}>
                  {m.sender.name || m.sender.email}
                </p>
              </div>
            );
          })
        )}
      </div>
      <form onSubmit={onSubmit} className="mt-3 flex gap-2">
        <input
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a message"
          required
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          Send
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
