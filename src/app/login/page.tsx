"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthPageTopBar from "@/components/AuthPageTopBar";
import PasswordField from "@/components/PasswordField";
import { validateEmail, validateLoginPassword } from "@/lib/validation";

type AuthUser = {
  id: number;
  name: string;
  email: string | null;
  role: string;
};

function homeForRole(role: string) {
  if (role === "ADMIN") return "/admin";
  if (role === "SELLER") return "/seller/dashboard";
  if (role === "RIDER") return "/rider/dashboard";
  return "/";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionUser, setSessionUser] = useState<AuthUser | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const ac = new AbortController();
    const t = window.setTimeout(() => ac.abort(), 12_000);
    (async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
          signal: ac.signal,
        });
        if (!res.ok) {
          return;
        }
        const data = (await res.json()) as {
          authenticated?: boolean;
          user?: AuthUser | null;
        };
        if (!cancelled && data.authenticated && data.user) {
          setSessionUser(data.user);
        }
      } catch {
        // Offline, timeout, or bad JSON — still show the sign-in form.
      } finally {
        window.clearTimeout(t);
        if (!cancelled) setSessionChecked(true);
      }
    })();
    return () => {
      cancelled = true;
      ac.abort();
      window.clearTimeout(t);
    };
  }, []);

  const signOut = async () => {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setSessionUser(null);
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  };

  const loginWith = async (loginEmail: string, loginPassword: string) => {
    setLoading(true);
    setMessage(null);

    const emailErr = validateEmail(loginEmail);
    if (emailErr) {
      setMessage(emailErr);
      setLoading(false);
      return;
    }
    const passErr = validateLoginPassword(loginPassword);
    if (passErr) {
      setMessage(passErr);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      if (!response.ok) {
        const err = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(err?.error ?? "Invalid credentials.");
      }
      const data = (await response.json()) as { user: AuthUser };
      // Full navigation so the session cookie is always applied before the next page load.
      window.location.assign(homeForRole(data.user.role));
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Login failed. Check email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await loginWith(email, password);
  };

  if (!sessionChecked) {
    return (
      <>
        <AuthPageTopBar variant="login" />
        <div className="flex min-h-[calc(100dvh-3.5rem)] min-h-screen items-center justify-center bg-slate-50 text-slate-600">
          Loading…
        </div>
      </>
    );
  }

  if (sessionUser) {
    return (
      <>
        <AuthPageTopBar variant="login" />
        <div className="min-h-[calc(100dvh-3.5rem)] min-h-screen bg-slate-50 text-slate-900">
          <div className="mx-auto flex max-w-md flex-col gap-6 px-6 py-16">
          <div>
            <h1 className="text-2xl font-semibold">You are signed in</h1>
            <p className="text-sm text-slate-500">
              {sessionUser.name}
              {sessionUser.email ? ` · ${sessionUser.email}` : ""}
            </p>
          </div>
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <button
              type="button"
              onClick={() => router.push(homeForRole(sessionUser.role))}
              className="w-full rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              Continue to app
            </button>
            <Link
              href="/account"
              className="block w-full rounded-full border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            >
              Account
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              disabled={signingOut}
              className="w-full rounded-full border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-800 transition hover:bg-rose-100 disabled:opacity-60"
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AuthPageTopBar variant="login" />
      <div className="min-h-[calc(100dvh-3.5rem)] min-h-screen bg-slate-50 text-slate-900">
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
            <label className="text-sm font-semibold" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="username"
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              placeholder="admin@dealarada.local"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <PasswordField
            id="login-password"
            label="Password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            toggleContext="password"
          />

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

          <p className="text-center text-sm text-slate-600">
            No account?{" "}
            <Link
              href="/register"
              className="font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Create one
            </Link>
          </p>
        </form>
        </div>
      </div>
    </>
  );
}
