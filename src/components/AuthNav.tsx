"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export type AuthNavLabels = {
  signUp: string;
  signIn: string;
  signOut: string;
  account: string;
};

type AuthUser = {
  id: number;
  name: string;
  email: string | null;
  role: string;
};

type MePayload = {
  authenticated?: boolean;
  user?: AuthUser | null;
};

export default function AuthNav({
  variant,
  labels,
}: {
  variant: "header" | "mobile";
  labels: AuthNavLabels;
}) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = (await res.json()) as MePayload;
      setUser(data.authenticated && data.user ? data.user : null);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [load]);

  const signOut = async () => {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  if (variant === "mobile") {
    if (user === undefined) {
      return (
        <div className="flex flex-col items-center gap-1 opacity-60">
          <span className="text-lg">👤</span>
          <span className="max-w-[4.5rem] truncate">…</span>
        </div>
      );
    }
    if (user) {
      return (
        <Link
          href="/account"
          className="flex flex-col items-center gap-1 text-emerald-700"
        >
          <span className="text-lg">👤</span>
          <span className="max-w-[4.5rem] truncate">{labels.account}</span>
        </Link>
      );
    }
    return (
      <div className="flex max-w-[4.5rem] flex-col items-center gap-0.5 leading-tight">
        <span className="text-base" aria-hidden>
          👤
        </span>
        <Link
          href="/register"
          className="text-[10px] font-semibold text-emerald-700 hover:underline"
        >
          {labels.signUp}
        </Link>
        <Link
          href="/login"
          className="text-[10px] font-semibold text-slate-600 hover:underline"
        >
          {labels.signIn}
        </Link>
      </div>
    );
  }

  /* header */
  if (user === undefined) {
    return (
      <div
        className="h-9 min-w-[180px] animate-pulse rounded-full bg-slate-100"
        aria-hidden
      />
    );
  }

  if (user) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span
          className="hidden max-w-[140px] truncate text-sm text-slate-600 sm:inline"
          title={user.email ?? user.name}
        >
          {user.name}
        </span>
        <button
          type="button"
          onClick={() => void signOut()}
          disabled={busy}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-rose-200 hover:text-rose-700 disabled:opacity-60"
        >
          {busy ? "…" : labels.signOut}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Link
        href="/register"
        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-200"
      >
        {labels.signUp}
      </Link>
      <Link
        href="/login"
        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
      >
        {labels.signIn}
      </Link>
    </div>
  );
}
