"use client";

import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [next, setNext] = useState("/admin");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rawNext = params.get("next");
    if (rawNext && rawNext.startsWith("/admin")) {
      setNext(rawNext);
    }
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed.");
      router.replace(next);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-4 pb-16 pt-4 md:pt-8">
      <div className="mx-auto max-w-3xl">
        <Header />
        <section className="paper-panel mx-auto mt-4 max-w-xl p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.2em] ink-muted">Admin Access</p>
          <h1 className="mt-2 font-serif text-2xl md:text-3xl">Admin Login</h1>
          <p className="mt-3 text-sm ink-muted">Enter your admin credentials to open the dashboard.</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs uppercase tracking-[0.14em] text-sepia-900/80">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-parchment mt-2"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.14em] text-sepia-900/80">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-parchment mt-2"
                autoComplete="current-password"
                required
              />
            </div>

            {error ? <p className="text-sm text-red-700">{error}</p> : null}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
