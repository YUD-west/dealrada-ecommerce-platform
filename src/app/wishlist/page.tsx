"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import useLanguage from "@/components/useLanguage";
import PublicHeaderAuth from "@/components/PublicHeaderAuth";
import {
  getWishlist,
  removeFromWishlist,
  type WishlistItem,
  WISHLIST_UPDATED_EVENT,
} from "@/lib/wishlist";

export default function WishlistPage() {
  const language = useLanguage();
  const [items, setItems] = useState<WishlistItem[]>([]);

  const t =
    language === "am"
      ? {
          title: "የምኞት ዝርዝር",
          subtitle: "የሚወዱዎትን እቃዎች እዚህ ያስቀምጡ።",
          empty: "እስካሁን ምንም አልጨመሩም።",
          browse: "ግዢ ይቀጥሉ",
          remove: "አስወግድ",
          view: "ምርት ይመልከቱ",
        }
      : {
          title: "Wishlist",
          subtitle: "Saved items stay on this device.",
          empty: "You have not saved anything yet.",
          browse: "Continue shopping",
          remove: "Remove",
          view: "View product",
        };

  useEffect(() => {
    const load = () => setItems(getWishlist());
    load();
    window.addEventListener(WISHLIST_UPDATED_EVENT, load);
    return () => window.removeEventListener(WISHLIST_UPDATED_EVENT, load);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200">
              <Image
                src="/dealarada-logo.png"
                alt="DealArada logo"
                width={120}
                height={36}
                className="h-8 w-auto object-contain"
              />
            </div>
            <span className="text-lg font-semibold">DealArada</span>
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-2 text-sm sm:gap-3">
            <PublicHeaderAuth />
            <Link
              href="/categories"
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-emerald-200"
            >
              {t.browse}
            </Link>
            <Link
              href="/cart"
              className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              {language === "am" ? "ጋሪ" : "Cart"}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
        <div>
          <h1 className="text-2xl font-semibold">{t.title}</h1>
          <p className="text-sm text-slate-500">{t.subtitle}</p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-slate-600">{t.empty}</p>
            <Link
              href="/categories"
              className="mt-4 inline-flex rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              {t.browse}
            </Link>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <li
                key={item.slug}
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <Link
                  href={`/products/${item.slug}`}
                  className="relative block overflow-hidden bg-slate-100"
                >
                  <Image
                    src={item.image}
                    alt=""
                    width={400}
                    height={280}
                    className="h-40 w-full object-cover"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                </Link>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                    {item.name}
                  </p>
                  <p className="text-sm font-semibold text-emerald-700">
                    {item.priceLabel}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-2">
                    <Link
                      href={`/products/${item.slug}`}
                      className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                    >
                      {t.view}
                    </Link>
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-700"
                      onClick={() => {
                        removeFromWishlist(item.slug);
                        setItems(getWishlist());
                      }}
                    >
                      {t.remove}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
