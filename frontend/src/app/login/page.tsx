"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
      const response = await fetch(`${apiOrigin}/api/v1/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setError("Invalid email or password.");
        return;
      }

      const data = await response.json();
      localStorage.setItem("pfm_access_token", data.access);
      localStorage.setItem("pfm_refresh_token", data.refresh);
      router.push("/");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      {/* Brand panel — mirrors the Dashboard's blue sidebar theme (ui/Dashboard.png) */}
      <div className="flex flex-col items-center justify-center gap-4 bg-blue-600 px-8 py-16 text-white md:w-1/2">
        <span className="text-4xl font-extrabold tracking-tight">PFM</span>
        <h1 className="max-w-xs text-center text-xl font-semibold text-white">
          Personal Finance Management
        </h1>
        <p className="max-w-xs text-center text-sm text-blue-100">
          Track income, expenses, budgets, and goals — all your family&apos;s finances, in one place.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
        <main className="w-full max-w-sm">
          <h2 className="mb-1 text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Welcome back
          </h2>
          <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
            Log in to your PFM account
          </p>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-1">
              <label htmlFor="login-email" className="text-sm font-medium text-black dark:text-zinc-50">
                Email
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border border-black/[.08] bg-white px-4 py-2.5 text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/[.145] dark:bg-white/5 dark:text-zinc-50"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="login-password" className="text-sm font-medium text-black dark:text-zinc-50">
                Password
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl border border-black/[.08] bg-white px-4 py-2.5 text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/[.145] dark:bg-white/5 dark:text-zinc-50"
              />
            </div>

            {error && (
              <p id="message-error" className="text-sm font-medium text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            <button
              id="btn-submit-login"
              type="submit"
              disabled={loading}
              className="mt-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
