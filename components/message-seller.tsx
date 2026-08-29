"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import ChatPanel from "@/components/chat-panel";
import { Button } from "@/components/ui/button";

export function MessageSeller({
  itemId,
  isOwner,
  itemStatus = "available",
}: {
  itemId: string;
  isOwner: boolean;
  itemStatus?: string;
}) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(isOwner);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOwner || status !== "authenticated") return;
    let cancelled = false;
    fetch(`/api/chat?itemId=${encodeURIComponent(itemId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.conversation) setOpen(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isOwner, status, itemId]);

  async function startConversation() {
    setError("");
    setPending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Could not start a conversation.");
        return;
      }
      setOpen(true);
    } finally {
      setPending(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="rounded-2xl border border-zinc-200 p-4 text-sm text-zinc-500">
        Loading…
      </div>
    );
  }

  if (isOwner) {
    return <ChatPanel itemId={itemId} isOwner initialStatus={itemStatus} />;
  }

  if (!session) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
        <h2 className="font-medium">Message seller</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Sign in to start a conversation about this listing.
        </p>
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(`/item/${itemId}`)}`}
          className="mt-3 inline-block rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="rounded-2xl border border-zinc-200 p-4">
        <h2 className="font-medium">Interested?</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Start a conversation to arrange a public meetup.
        </p>
        <Button
          type="button"
          size="lg"
          className="mt-3 w-full"
          disabled={pending}
          onClick={startConversation}
        >
          {pending ? "Opening…" : "Message seller"}
        </Button>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return <ChatPanel itemId={itemId} isOwner={false} initialStatus={itemStatus} />;
}
