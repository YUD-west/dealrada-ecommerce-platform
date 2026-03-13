"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AuthUser = {
  id: number;
  name: string;
  email: string | null;
  role: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loginWith = async (loginEmail: string, loginPassword: string) => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      if (!response.ok) {
        throw new Error("Invalid credentials.");
      }
      const data = (await response.json()) as { user: AuthUser };
      const role = data.user.role;
      if (role === "ADMIN") {
        router.push("/admin");
      } else if (role === "SELLER") {
        router.push("/seller/dashboard");
      } else {
        router.push("/");
      }
    } catch {
      setMessage("Login failed. Check email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await loginWith(email, password);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-md flex-col gap-6 px-6 py-16">
        <div>
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-slate-500">
            Use your DealArada account to continue.
          </p>
        </div>

        <form
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
            Quick login:
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-emerald-200"
                onClick={() => loginWith("admin@dealarada.local", "Admin@2026")}
              >
                Admin
              </button>
              <button
                type="button"
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-emerald-200"
                onClick={() => loginWith("buyer@dealarada.local", "Buyer@2026")}
              >
                Buyer
              </button>
              <button
                type="button"
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-emerald-200"
                onClick={() => loginWith("yusuf@seller.com", "Seller@2026")}
              >
                Seller
              </button>
              <button
                type="button"
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-emerald-200"
                onClick={() => loginWith("rider@dealarada.local", "Rider@2026")}
              >
                Rider
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Email</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              placeholder="admin@dealarada.local"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Password</label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {message && (
            <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-70"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
