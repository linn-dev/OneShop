"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo, Wordmark } from "@/components/logo";
import { ProductSearch } from "@/components/product-search";
import { cn } from "@/lib/utils";

export default function Header() {
  const { data: session, status, update } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [verifying, setVerifying] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!accountRef.current?.contains(e.target as Node)) setAccountOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

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

  const initials = accountInitials(session?.user?.name, session?.user?.email);
  const navLink = (href: string, label: string) => {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return (
      <Link
        href={href}
        className={cn(
          "rounded-full px-3 py-1.5 text-sm font-medium transition",
          active
            ? "bg-emerald-50 text-emerald-950"
            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-30 border-b border-emerald-100/80 bg-background/75 shadow-sm shadow-emerald-950/[0.03] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:gap-4">
        <Link href="/" title="OneShopMM" className="flex shrink-0 items-center gap-2">
          <Logo />
          <Wordmark className="hidden sm:inline" />
        </Link>

        <Suspense fallback={<SearchFallback />}>
          <ProductSearch className="hidden min-w-0 flex-1 md:block" />
        </Suspense>

        <nav className="ml-auto flex items-center gap-1 sm:gap-1.5">
          <div className="hidden items-center gap-1 sm:flex">
            {navLink("/", "Browse")}
            {session?.user && navLink("/profile", "Profile")}
          </div>
          <Link
            href="/sell"
            className="rounded-full bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-emerald-900/10 transition hover:bg-emerald-700"
          >
            Sell
          </Link>
          {status === "loading" ? (
            <span className="size-9 rounded-full bg-zinc-100" aria-hidden />
          ) : session?.user ? (
            <div ref={accountRef} className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-200/80 transition hover:ring-emerald-300"
                aria-expanded={accountOpen}
                aria-haspopup="menu"
              >
                {initials}
              </button>
              {accountOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-emerald-100 bg-white py-1 shadow-xl shadow-emerald-950/5"
                >
                  <p className="truncate px-3 py-2 text-xs text-zinc-500">{session.user.email}</p>
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-sm hover:bg-emerald-50"
                    role="menuitem"
                  >
                    Profile
                  </Link>
                  {session.user.phoneVerified ? (
                    <p className="px-3 py-2 text-xs font-medium text-emerald-800">Phone verified</p>
                  ) : (
                    <button
                      type="button"
                      onClick={verifyPhone}
                      disabled={verifying}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-amber-50 disabled:opacity-60"
                      role="menuitem"
                    >
                      {verifying ? "Verifying…" : "Verify phone (mock)"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="block w-full px-3 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-50"
                    role="menuitem"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            >
              Sign in
            </Link>
          )}
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-full text-zinc-700 hover:bg-zinc-100 sm:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </nav>
      </div>

      <div className="border-t border-emerald-50 px-4 py-2 md:hidden">
        <Suspense fallback={<SearchFallback />}>
          <ProductSearch />
        </Suspense>
      </div>

      {menuOpen && (
        <div className="border-t border-emerald-100 bg-white px-4 py-3 sm:hidden">
          <div className="flex flex-col gap-1">
            <Link href="/" className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-emerald-50">
              Browse
            </Link>
            {session?.user && (
              <Link
                href="/profile"
                className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-emerald-50"
              >
                Profile
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function SearchFallback() {
  return <div className="h-10 w-full rounded-full bg-zinc-100" aria-hidden />;
}

function accountInitials(name?: string | null, email?: string | null): string {
  const source = (name || email || "?").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  const local = source.includes("@") ? source.slice(0, source.indexOf("@")) : source;
  return local.slice(0, 2).toUpperCase() || "?";
}
