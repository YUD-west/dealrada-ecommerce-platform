"use client";

import Image from "next/image";
import Link from "next/link";
import useLanguage from "@/components/useLanguage";

const cartItems = [
  {
    name: "Woliso roasted coffee (1kg)",
    price: 520,
    qty: 1,
  },
  {
    name: "Weekly grocery pack",
    price: 890,
    qty: 1,
  },
];

export default function CartPage() {
  const language = useLanguage();
  const t =
    language === "am"
      ? {
          continueShopping: "ግዢን ቀጥል",
          checkout: "ክፍያ",
          yourCart: "የእርስዎ ጋሪ",
          reviewItems: "እቃዎችን ያረጋግጡ እና ወደ ክፍያ ይቀጥሉ።",
          qty: "ብዛት",
          orderSummary: "የትዕዛዝ ማጠቃለያ",
          subtotal: "ንዑስ ድምር",
          deliveryFee: "የመድረሻ ክፍያ",
          total: "አጠቃላይ",
          proceed: "ወደ ክፍያ ቀጥል",
        }
      : {
          continueShopping: "Continue shopping",
          checkout: "Checkout",
          yourCart: "Your cart",
          reviewItems: "Review items and proceed to checkout.",
          qty: "Qty",
          orderSummary: "Order summary",
          subtotal: "Subtotal",
          deliveryFee: "Delivery fee",
          total: "Total",
          proceed: "Proceed to checkout",
        };
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = 40;
  const total = subtotal + deliveryFee;

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
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Link
              href="/categories"
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-emerald-200"
            >
              {t.continueShopping}
            </Link>
            <Link
              href="/checkout"
              className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              {t.checkout}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:grid-cols-[1.5fr_0.9fr]">
        <section className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold">{t.yourCart}</h1>
            <p className="text-sm text-slate-500">
              {t.reviewItems}
            </p>
          </div>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.name}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-xl bg-slate-100" />
                  <div>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-slate-500">
                      {t.qty}: {item.qty}
                    </p>
                  </div>
                </div>
                <div className="text-sm font-semibold">
                  {item.price.toLocaleString()} ETB
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">{t.orderSummary}</h2>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>{t.subtotal}</span>
              <span>{subtotal.toLocaleString()} ETB</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t.deliveryFee}</span>
              <span>{deliveryFee.toLocaleString()} ETB</span>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold">
            <span>{t.total}</span>
            <span>{total.toLocaleString()} ETB</span>
          </div>
          <Link
            href="/checkout"
            className="inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            {t.proceed}
          </Link>
        </aside>
      </main>
    </div>
  );
}
