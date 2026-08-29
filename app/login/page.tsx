"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Could not create account.");
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError(
          mode === "login"
            ? "Invalid email or password."
            : "Account created, but sign-in failed."
        );
        return;
      }

      router.push(result?.url || callbackUrl);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">
        {mode === "login" ? "Sign in" : "Create an account"}
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Email and password only. No magic links.
      </p>

      <div className="mt-4 grid grid-cols-2 rounded-lg bg-zinc-100 p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded-md py-1.5 ${
            mode === "login" ? "bg-white font-medium shadow-sm" : "text-zinc-500"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`rounded-md py-1.5 ${
            mode === "signup" ? "bg-white font-medium shadow-sm" : "text-zinc-500"
          }`}
        >
          Sign up
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        {mode === "signup" && (
          <label className="block text-sm">
            <span className="text-zinc-600">Name</span>
            <input
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ada"
              autoComplete="name"
            />
          </label>
        )}
        <label className="block text-sm">
          <span className="text-zinc-600">Email</span>
          <input
            type="email"
            required
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>
        <label className="block text-sm">
          <span className="text-zinc-600">Password</span>
          <input
            type="password"
            required
            minLength={6}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
        >
          {pending
            ? "Please wait…"
            : mode === "login"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="px-4 py-16">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
