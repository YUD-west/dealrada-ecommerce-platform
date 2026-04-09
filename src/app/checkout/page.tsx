"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import useLanguage from "@/components/useLanguage";

export default function CheckoutPage() {
  const language = useLanguage();
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [mobileMethods, setMobileMethods] = useState<
    Array<{ id: string; label: string }>
  >([
    { id: "telebirr", label: "Telebirr" },
    { id: "cbe-birr", label: "CBE Birr" },
    { id: "mpesa", label: "M-Pesa" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [guestCheckout, setGuestCheckout] = useState(true);
  const [authUser, setAuthUser] = useState<{ name?: string } | null>(null);
  const [paymentRef, setPaymentRef] = useState<string | null>(null);
  const [paymentInstructions, setPaymentInstructions] = useState<string | null>(
    null
  );
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
    wallet: "",
    transactionId: "",
  });
  const [selectedProvider, setSelectedProvider] = useState("Telebirr");
  const t =
    language === "am"
      ? {
          checkoutTitle: "ክፍያ",
          checkoutSubtitle: "ትዕዛዝዎን በሶስት ቀላል ደረጃዎች ያጠናቅቁ።",
          backToCart: "ወደ ጋሪ ተመለስ",
          stepDelivery: "የመድረሻ ዝርዝሮች",
          stepPayment: "የክፍያ ዘዴ",
          stepConfirm: "ትዕዛዝ አረጋግጥ",
          guestCheckout: "እንግዳ ግዢ",
          autofilledFor: "ለ{name} ተሞልቷል",
          fullName: "ሙሉ ስም",
          phone: "ስልክ ቁጥር",
          address: "የመድረሻ አድራሻ",
          deliveryTime: "የመድረሻ ጊዜ",
          asap: "በፍጥነት",
          laterToday: "በዛሬ ቀን በኋላ",
          tomorrowMorning: "ነገ ጠዋት",
          paymentMethod: "የክፍያ ዘዴ",
          codDefault: "በመቀበል ጊዜ (ነባር)",
          telebirr: "Telebirr",
          cbeBirr: "CBE Birr",
          telebirrNote: "Telebirr ክፍያ በኢትዮጵያ ይገኛል።",
          mobileMoney: "የሞባይል ገንዘብ ክፍያ",
          mobileMoneyDesc: "ክፍያ ያድርጉ እና ትዕዛዝዎን ያረጋግጡ።",
          provider: "አቅራቢ",
          walletNumber: "ዋሌት ቁጥር",
          transactionId: "የግብይት መለያ",
          confirmMobile: "የሞባይል ክፍያ አረጋግጥ",
          generatePayment: "የክፍያ ማስጀመሪያ ኮድ ፍጠር",
          paymentReference: "የክፍያ ማጣቀሻ",
          paymentInstructions: "የክፍያ መመሪያ",
          generateFirst: "መጀመሪያ የክፍያ ማጣቀሻ ፍጠር።",
          orderNotes: "የትዕዛዝ ማስታወሻ",
          notesPlaceholder: "ልዩ መመሪያ ካለ?",
          step1: "ደረጃ 1: የመድረሻ ዝርዝሮች",
          step2: "ደረጃ 2: የክፍያ ዘዴ",
          step3: "ደረጃ 3: ትዕዛዝ አረጋግጥ",
          coupon: "የመጀመሪያ ገዢ ኩፖን: WELCOME5 (5% ቅናሽ)",
          orderSummary: "የትዕዛዝ ማጠቃለያ",
          items: "እቃዎች",
          subtotal: "ንዑስ ድምር",
          deliveryFee: "የመድረሻ ክፍያ",
          total: "አጠቃላይ",
          placeOrder: "ትዕዛዝ አስገባ",
          placingOrder: "ትዕዛዝ በመላክ ላይ...",
          terms:
            "ትዕዛዝ ሲያስገቡ የDealArada ውሎችን እና የመድረሻ ፖሊሲን ትቀበላላችሁ።",
          freeDeliveryNote: "ከ1500 ብር በላይ ነጻ መድረስ",
          orderViaWhatsapp: "በWhatsApp አዘዝ",
          smsNote: "ትዕዛዝ ከተጠናቀቀ በኋላ የSMS ማረጋገጫ ይላካል።",
          orderPlaced: "ትዕዛዝ ተላክ! የትዕዛዝ መለያ: {id}",
          orderError: "ትዕዛዝ ማስገባት አልተሳካም። እንደገና ይሞክሩ።",
        }
      : {
          checkoutTitle: "Checkout",
          checkoutSubtitle: "Complete your order in three simple steps.",
          backToCart: "Back to cart",
          stepDelivery: "Delivery Details",
          stepPayment: "Payment Method",
          stepConfirm: "Confirm Order",
          guestCheckout: "Guest checkout",
          autofilledFor: "Autofilled for {name}",
          fullName: "Full name",
          phone: "Phone number",
          address: "Delivery address",
          deliveryTime: "Delivery time",
          asap: "As soon as possible",
          laterToday: "Later today",
          tomorrowMorning: "Tomorrow morning",
          paymentMethod: "Payment method",
          codDefault: "Cash on delivery (default)",
          telebirr: "Telebirr",
          cbeBirr: "CBE Birr",
          telebirrNote: "Telebirr payments are supported for Ethiopia.",
          mobileMoney: "Mobile money payment",
          mobileMoneyDesc: "Pay instantly and confirm your order.",
          provider: "Provider",
          walletNumber: "Wallet number",
          transactionId: "Transaction ID",
          confirmMobile: "Confirm mobile payment",
          generatePayment: "Generate payment reference",
          paymentReference: "Payment reference",
          paymentInstructions: "Payment instructions",
          generateFirst: "Generate a payment reference first.",
          orderNotes: "Order notes",
          notesPlaceholder: "Any special instructions?",
          step1: "Step 1: Delivery Details",
          step2: "Step 2: Payment Method",
          step3: "Step 3: Confirm Order",
          coupon: "First-time buyer coupon: WELCOME5 (5% off).",
          orderSummary: "Order summary",
          items: "Items",
          subtotal: "Subtotal",
          deliveryFee: "Delivery fee",
          total: "Total",
          placeOrder: "Place order",
          placingOrder: "Placing order...",
          terms:
            "By placing an order, you agree to DealArada terms and delivery policy.",
          freeDeliveryNote: "Free delivery for orders above 1500 ETB",
          orderViaWhatsapp: "Order via WhatsApp",
          smsNote: "SMS confirmation will be sent after you place the order.",
          orderPlaced: "Order placed! Order ID: {id}",
          orderError: "Could not place order. Try again.",
        };

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const response = await fetch("/api/payments");
        if (!response.ok) return;
        const data = (await response.json()) as {
          items: Array<{ id: string; label: string; enabled: boolean }>;
        };
        const providers = data.items
          .filter((item) => item.enabled && item.id !== "cod")
          .map((item) => ({ id: item.id, label: item.label }));
        if (providers.length > 0) {
          setMobileMethods(providers);
          setSelectedProvider(providers[0].label);
        }
      } catch {
        // Keep fallback providers if API fails.
      }
    };
    loadPayments();
  }, []);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) return;
        const data = (await response.json()) as { user?: { name?: string } };
        if (data.user?.name) {
          setAuthUser(data.user);
          setGuestCheckout(false);
          setFormData((prev) =>
            prev.name ? prev : { ...prev, name: data.user?.name ?? "" }
          );
        }
      } catch {
        // Ignore auth failures for guest checkout.
      }
    };

    const saved = window.localStorage.getItem("dealarada-checkout");
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<typeof formData>;
      setFormData((prev) => ({ ...prev, ...parsed }));
    }

    loadAuth();
  }, []);

  useEffect(() => {
    if (paymentMethod === "cod") {
      setPaymentRef(null);
      setPaymentInstructions(null);
      return;
    }
    const method = mobileMethods.find((item) => item.id === paymentMethod);
    if (method) setSelectedProvider(method.label);
  }, [paymentMethod, mobileMethods]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      if (paymentMethod !== "cod" && !paymentRef) {
        setMessage(t.generateFirst);
        setSubmitting(false);
        return;
      }
      window.localStorage.setItem(
        "dealarada-checkout",
        JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
        })
      );
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.name,
          customerPhone: formData.phone,
          address: formData.address,
          paymentMethod,
          paymentStatus:
            paymentMethod === "cod"
              ? "DUE_ON_DELIVERY"
              : formData.transactionId || paymentRef
                ? "PENDING"
                : "UNPAID",
          transactionId: formData.transactionId || paymentRef || undefined,
          items: orderItems,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(errorData?.error ?? "Failed to place order.");
      }

      const data = (await response.json()) as { item?: { id?: string } };
      setMessage(
        t.orderPlaced.replace("{id}", data.item?.id ?? "DA-NEW")
      );
      setFormData({
        name: "",
        phone: "",
        address: "",
        notes: "",
        wallet: "",
        transactionId: "",
      });
      setPaymentRef(null);
      setPaymentInstructions(null);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : t.orderError
      );
    } finally {
      setSubmitting(false);
    }
  };

  const orderItems = [
    {
      name: "Women’s casual dress",
      price: 890,
      quantity: 1,
    },
    {
      name: "Budget earphones",
      price: 560,
      quantity: 1,
    },
  ];
  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = 40;
  const total = subtotal + deliveryFee;

  const handlePaymentInit = async () => {
    setPaymentLoading(true);
    setPaymentInstructions(null);
    setPaymentRef(null);
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedProvider,
          amount: total,
          phone: formData.phone,
          wallet: formData.wallet,
        }),
      });
      if (!response.ok) {
        throw new Error("Unable to initialize payment.");
      }
      const data = (await response.json()) as {
        reference?: string;
        instructions?: string;
      };
      setPaymentRef(data.reference ?? null);
      setPaymentInstructions(data.instructions ?? null);
    } catch {
      setPaymentInstructions(
        language === "am"
          ? "የክፍያ መጀመሪያ ሊተካ አልተቻለም።"
          : "Could not generate payment reference."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

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
              href="/cart"
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-emerald-200"
            >
              {t.backToCart}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold">{t.checkoutTitle}</h1>
            <p className="text-sm text-slate-500">
              {t.checkoutSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-xs font-semibold text-slate-600 shadow-sm">
            {[t.stepDelivery, t.stepPayment, t.stepConfirm].map(
              (step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-slate-600"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-semibold text-white">
                    {index + 1}
                  </span>
                  {step}
                </div>
              )
            )}
          </div>

          <form
            id="checkout-form"
            className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            onSubmit={handleSubmit}
          >
            <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-xs text-orange-700">
              {t.coupon}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
              <label className="flex items-center gap-2 font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={guestCheckout}
                  onChange={(event) => setGuestCheckout(event.target.checked)}
                />
                {t.guestCheckout}
              </label>
              {authUser?.name && !guestCheckout && (
                <span className="text-slate-500">
                  {t.autofilledFor.replace("{name}", authUser.name)}
                </span>
              )}
            </div>

            <div className="text-sm font-semibold text-slate-900">{t.step1}</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold">{t.fullName}</label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  placeholder={t.fullName}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">{t.phone}</label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  placeholder="+251 9xx xxx xxx"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">{t.address}</label>
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                placeholder={t.address}
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="text-sm font-semibold text-slate-900">{t.step2}</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold">{t.deliveryTime}</label>
                <select className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100">
                  <option>{t.asap}</option>
                  <option>{t.laterToday}</option>
                  <option>{t.tomorrowMorning}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">{t.paymentMethod}</label>
                <select
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                >
                  <option value="cod">{t.codDefault}</option>
                  {mobileMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.label}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-emerald-700">
                  {t.telebirrNote}
                </div>
              </div>
            </div>

            {paymentMethod !== "cod" && (
              <div className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div>
                  <p className="text-sm font-semibold text-emerald-700">
                    {t.mobileMoney}
                  </p>
                  <p className="text-xs text-emerald-600">
                    {t.mobileMoneyDesc}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">{t.provider}</label>
                    <select
                      className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      value={selectedProvider}
                      onChange={(event) =>
                        setSelectedProvider(event.target.value)
                      }
                    >
                      {mobileMethods.map((provider) => (
                        <option key={provider.id} value={provider.label}>
                          {provider.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">
                      {t.walletNumber}
                    </label>
                    <input
                      className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      placeholder="+251 9xx xxx xxx"
                      name="wallet"
                      value={formData.wallet}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">
                    {t.transactionId}
                  </label>
                  <input
                    className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    placeholder={t.transactionId}
                    name="transactionId"
                    value={formData.transactionId}
                    onChange={handleChange}
                  />
                </div>
                <button
                  type="button"
                  className="w-full rounded-full border border-emerald-200 px-5 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-300 disabled:opacity-60"
                  onClick={handlePaymentInit}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? t.placingOrder : t.generatePayment}
                </button>
                {paymentRef && (
                  <div className="rounded-xl bg-white px-4 py-3 text-xs text-emerald-700">
                    <p className="font-semibold">{t.paymentReference}</p>
                    <p>{paymentRef}</p>
                  </div>
                )}
                {paymentInstructions && (
                  <div className="rounded-xl bg-white px-4 py-3 text-xs text-slate-600">
                    <p className="font-semibold text-slate-700">
                      {t.paymentInstructions}
                    </p>
                    <p>{paymentInstructions}</p>
                  </div>
                )}
                <button
                  type="button"
                  className="w-full rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  {t.confirmMobile}
                </button>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold">{t.orderNotes}</label>
              <textarea
                className="min-h-[100px] w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                placeholder={t.notesPlaceholder}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>
            <div className="text-sm font-semibold text-slate-900">{t.step3}</div>
            {message && (
              <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </div>
            )}
          </form>
        </section>

        <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-lg font-semibold">{t.orderSummary}</h2>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            {t.freeDeliveryNote}
          </div>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>{t.items}</span>
              <span>{orderItems.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t.subtotal}</span>
              <span>{subtotal.toLocaleString()} ETB</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t.deliveryFee}</span>
              <span>{deliveryFee.toLocaleString()} ETB</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold">
              <span>{t.total}</span>
              <span>{total.toLocaleString()} ETB</span>
            </div>
          </div>
          <button
            className="w-full rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-70"
            type="submit"
            form="checkout-form"
            disabled={submitting}
          >
            {submitting ? t.placingOrder : t.placeOrder}
          </button>
          <Link
            href="https://wa.me/251000000000?text=Hi%20DealArada%2C%20I%20want%20to%20place%20an%20order."
            className="inline-flex w-full items-center justify-center rounded-full border border-emerald-200 px-5 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-300"
            target="_blank"
            rel="noreferrer"
          >
            {t.orderViaWhatsapp}
          </Link>
          <p className="text-xs text-slate-500">
            {t.terms}
          </p>
          <p className="text-xs text-slate-500">
            {t.smsNote}
          </p>
        </aside>
      </main>
    </div>
  );
}
