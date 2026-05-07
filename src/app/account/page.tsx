"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useLanguage from "@/components/useLanguage";

type AuthUser = {
  id: number;
  name: string;
  email: string | null;
  role: string;
};

export default function AccountPage() {
  const router = useRouter();
  const language = useLanguage();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const t =
    language === "am"
      ? {
          title: "መለያ",
          signedIn: "እንደ ተጠቃሚ ግብተዋል",
          email: "ኢሜይል",
          role: "ሚና",
          signOut: "ውጣ",
          home: "መነሻ",
          loading: "በመጫን ላይ…",
          redirecting: "ወደ ግባት እያስተላለፍ…",
        }
      : {
          title: "Account",
          signedIn: "You are signed in",
          email: "Email",
          role: "Role",
          signOut: "Sign out",
          home: "Home",
          loading: "Loading…",
          redirecting: "Redirecting to sign in…",
        };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const loadMe = async () => {
          const res = await fetch("/api/auth/me", { credentials: "include" });
          const data = (await res.json().catch(() => ({}))) as {
            authenticated?: boolean;
            user?: AuthUser | null;
          };
          return { res, data };
        };

        let { res, data } = await loadMe();
        if (
          !cancelled &&
          res.ok &&
          (!data.authenticated || !data.user)
        ) {
          await new Promise((r) => setTimeout(r, 400));
          ({ res, data } = await loadMe());
        }

        if (cancelled) return;
        if (!res.ok || !data.authenticated || !data.user) {
          router.replace("/login?next=/account");
          return;
        }
        setUser(data.user);
      } catch {
        if (!cancelled) router.replace("/login?next=/account");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const signOut = async () => {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      router.replace("/");
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        {t.loading}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        {t.redirecting}
      </div>
    );
  }

  const dash =
    user.role === "ADMIN"
      ? { href: "/admin", label: language === "am" ? "አስተዳዳሪ" : "Admin" }
      : user.role === "SELLER"
        ? {
            href: "/seller/dashboard",
            label: language === "am" ? "የሻጭ ዳሽቦርድ" : "Seller dashboard",
          }
        : user.role === "RIDER"
          ? {
              href: "/rider/dashboard",
              label: language === "am" ? "የሹፌር ዳሽቦርድ" : "Rider dashboard",
            }
          : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-md flex-col gap-6 px-6 py-12">
        <div>
          <h1 className="text-2xl font-semibold">{t.title}</h1>
          <p className="text-sm text-slate-500">{t.signedIn}</p>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t.email}
            </p>
            <p className="text-sm font-medium">{user.email ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t.role}
            </p>
            <p className="text-sm font-medium">{user.role}</p>
          </div>
          <p className="text-base font-semibold text-slate-800">{user.name}</p>
        </div>

        {dash ? (
          <Link
            href={dash.href}
            className="block rounded-full border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-200"
          >
            {dash.label}
          </Link>
        ) : null}

        <button
          type="button"
          onClick={() => void signOut()}
          disabled={busy}
          className="w-full rounded-full border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-800 transition hover:bg-rose-100 disabled:opacity-60"
        >
          {busy ? "…" : t.signOut}
        </button>

        <Link
          href="/"
          className="block text-center text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          ← {t.home}
        </Link>
      </div>
    </div>
  );
}
