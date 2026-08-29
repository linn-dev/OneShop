"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [verifying, setVerifying] = useState(false);

  async function verifyPhone() {
    setVerifying(true);
    try {
      const res = await fetch("/api/verify-phone", { method: "POST" });
      if (!res.ok) return;
      await update({ phoneVerified: true });
      router.refresh();
    } finally {
      setVerifying(false);
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-900">
          Swappr
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/" className="text-zinc-600 hover:text-zinc-900">
            Browse
          </Link>
          <Link
            href="/sell"
            className="rounded-full bg-zinc-900 px-3 py-1.5 font-medium text-white hover:bg-zinc-700"
          >
            Sell
          </Link>
          {status === "loading" ? (
            <span className="text-zinc-400">…</span>
          ) : session?.user ? (
            <div className="flex items-center gap-2">
              {session.user.phoneVerified ? (
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                  Phone verified
                </span>
              ) : (
                <button
                  type="button"
                  onClick={verifyPhone}
                  disabled={verifying}
                  className="rounded-full border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-60"
                >
                  {verifying ? "Verifying…" : "Verify phone (mock)"}
                </button>
              )}
              <span className="hidden max-w-[10rem] truncate text-zinc-500 sm:inline">
                {session.user.email}
              </span>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-zinc-500 hover:text-zinc-900"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-zinc-700 hover:text-zinc-900">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
