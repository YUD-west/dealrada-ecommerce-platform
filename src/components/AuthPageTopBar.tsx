"use client";

import Image from "next/image";
import Link from "next/link";
import useLanguage from "@/components/useLanguage";

export default function AuthPageTopBar({
  variant,
}: {
  variant: "login" | "register";
}) {
  const language = useLanguage();
  const t =
    language === "am"
      ? {
          home: "መነሻ",
          other: variant === "login" ? "መለያ ፍጠር" : "ግባ",
          otherHref: variant === "login" ? "/register" : "/login",
        }
      : {
          home: "Home",
          other: variant === "login" ? "Create account" : "Sign in",
          otherHref: variant === "login" ? "/register" : "/login",
        };

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="flex items-center gap-2 text-slate-900">
          <div className="rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
            <Image
              src="/dealarada-logo.png"
              alt=""
              width={88}
              height={28}
              className="h-7 w-auto object-contain"
            />
          </div>
          <span className="text-sm font-semibold">{t.home}</span>
        </Link>
        <Link
          href={t.otherHref}
          className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
        >
          {t.other}
        </Link>
      </div>
    </header>
  );
}
