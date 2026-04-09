"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import useLanguage from "@/components/useLanguage";
import {
  translateTrackingDetail,
  translateTrackingTitle,
} from "@/lib/i18n";

type TimelineStep = {
  title: string;
  time: string;
  detail: string;
};

type TrackingResponse = {
  orderId: string;
  status: string;
  timeline: TimelineStep[];
};

const fallbackSteps = [
  {
    title: "Order placed",
    time: "Today, 10:04 AM",
    detail: "We received your order.",
    status: "done",
  },
  {
    title: "Shop confirmed",
    time: "Today, 10:12 AM",
    detail: "Seller packed the items.",
    status: "done",
  },
  {
    title: "Out for delivery",
    time: "Today, 10:30 AM",
    detail: "Rider is on the way.",
    status: "active",
  },
  {
    title: "Delivered",
    time: "ETA 10:55 AM",
    detail: "Customer receives the order.",
    status: "pending",
  },
];

export default function TrackPage() {
  const [tracking, setTracking] = useState<TrackingResponse | null>(null);
  const language = useLanguage();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "DA-1023";
  const [notifyMessage, setNotifyMessage] = useState<string | null>(null);
  const [smsPhone, setSmsPhone] = useState("");
  const [telegramUser, setTelegramUser] = useState("@SatoshiFlash");
  const [emailAddress, setEmailAddress] = useState("");
  const t =
    language === "am"
      ? {
          shop: "ሱቅ",
          cart: "ጋሪ",
          track: "ክትትል",
          orderIdPlaceholder: "የትዕዛዝ መለያ (ለምሳሌ፣ DA-1023)",
          deliveryEta: "የመድረሻ ጊዜ (ETA)",
          rider: "ራይደር",
          mapSoon: "የካርታ እይታ በቅርቡ ይጨምራል",
          failedEnable: "ማስታወቂያዎችን ማንቃት አልተሳካም።",
          enabledSms: "የSMS ማስታወቂያ ተነቅቷል።",
          enabledEmail: "የኢሜይል ማስታወቂያ ተነቅቷል።",
          enabledTelegram: "የTelegram ማስታወቂያ ተነቅቷል።",
          enabledFor: "ለ{contact} ተነቅቷል።",
        }
      : {
          shop: "Shop",
          cart: "Cart",
          track: "Track",
          orderIdPlaceholder: "Order ID (e.g., DA-1023)",
          deliveryEta: "Delivery ETA",
          rider: "Rider",
          mapSoon: "Live rider map coming soon",
          failedEnable: "Failed to enable updates.",
          enabledSms: "SMS updates enabled.",
          enabledEmail: "Email updates enabled.",
          enabledTelegram: "Telegram updates enabled.",
          enabledFor: "enabled for {contact}.",
        };

  useEffect(() => {
    const loadTracking = async () => {
      try {
        const response = await fetch("/api/tracking");
        if (!response.ok) return;
        const data = (await response.json()) as TrackingResponse;
        setTracking(data);
      } catch {
        setTracking(null);
      }
    };
    loadTracking();
  }, []);

  const steps = tracking?.timeline?.length
    ? tracking.timeline.map((item, index) => ({
        ...item,
        status: index === tracking.timeline.length - 1 ? "active" : "done",
      }))
    : fallbackSteps;
  const activeStep = steps.find((step) => step.status === "active") ?? steps[0];
  const etaText =
    activeStep?.title === "Delivered"
      ? language === "am"
        ? "ትዕዛዝዎ ተደርሷል"
        : "Delivered"
      : language === "am"
        ? "መጨረሻ ደረሰበት ጊዜ: 25 ደቂቃ"
        : "Estimated arrival: 25 minutes";

  const sendNotificationStub = async (
    channel: "SMS" | "TELEGRAM" | "EMAIL"
  ) => {
    setNotifyMessage(null);
    const telegramHandle = telegramUser.trim()
      ? telegramUser.trim().startsWith("@")
        ? telegramUser.trim()
        : `@${telegramUser.trim()}`
      : "";
    const email = emailAddress.trim();
    const contactLabel =
      channel === "SMS"
        ? smsPhone.trim()
        : channel === "EMAIL"
          ? email
          : telegramHandle || (language === "am" ? telegramHandle : "Telegram");
    try {
      const response = await fetch("/api/notifications/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          orderCode: orderId,
          contact: contactLabel || undefined,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to trigger notification.");
      }
      const enabledBase =
        channel === "SMS"
          ? t.enabledSms
          : channel === "EMAIL"
            ? t.enabledEmail
            : t.enabledTelegram;
      setNotifyMessage(
        contactLabel
          ? language === "am"
            ? `${enabledBase} ${t.enabledFor.replace("{contact}", contactLabel)}`
            : `${enabledBase.slice(0, -1)} ${t.enabledFor.replace("{contact}", contactLabel)}`
          : enabledBase
      );
    } catch {
      setNotifyMessage(t.failedEnable);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold">
            DealArada
          </Link>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Link href="/categories">{t.shop}</Link>
            <Link href="/cart">{t.cart}</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        <div>
          <h1 className="text-2xl font-semibold">
            {language === "am" ? "ትዕዛዝዎን ይከታተሉ" : "Track your order"}
          </h1>
          <p className="text-sm text-slate-500">
            {language === "am"
              ? "የትዕዛዝ መለያዎን ያስገቡ እና ቀጥታ ሁኔታ ይቀበሉ።"
              : "Enter your order ID to get real-time updates."}
          </p>
          <p className="mt-2 text-xs text-emerald-600">
            {language === "am"
              ? `የሚታየው ትዕዛዝ ${orderId}`
              : `Showing tracking for ${orderId}`}
          </p>
        </div>

        <div className="grid gap-6 rounded-2xl border border-slate-200 p-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <input
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm"
                placeholder={t.orderIdPlaceholder}
              />
              <button className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white">
                {t.track}
              </button>
            </div>

            <div className="space-y-4">
              {steps.map((step) => (
                <div
                  key={step.title}
                  className="flex gap-4 rounded-2xl border border-slate-200 p-4"
                >
                  <div
                    className={`mt-1 h-3 w-3 rounded-full ${
                      step.status === "done"
                        ? "bg-emerald-600"
                        : step.status === "active"
                          ? "bg-amber-500"
                          : "bg-slate-300"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-semibold">
                      {translateTrackingTitle(step.title, language)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {translateTrackingDetail(step.detail, language)}
                    </p>
                    <p className="text-xs text-slate-400">{step.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">
                    {language === "am"
                      ? "የመድረሻ ጊዜ (ETA)"
                      : t.deliveryEta}
                  </p>
                  <p className="text-xs text-slate-500">{etaText}</p>
                </div>
                <div className="text-xs text-slate-500">
                  {language === "am" ? `${t.rider}: ሲሳይ` : `${t.rider}: Sisay`}
                </div>
              </div>
              <div className="mt-3 h-40 w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-500">
                {t.mapSoon}
              </div>
            </div>
          </div>

          <aside className="space-y-4 rounded-2xl border border-slate-200 p-5">
            <h2 className="text-lg font-semibold">
              {language === "am" ? "የሁኔታ ማስታወቂያዎች" : "Get status updates"}
            </h2>
            <p className="text-sm text-slate-500">
              {language === "am"
                ? "ለእያንዳንዱ የመድረስ እርምጃ SMS ወይም Telegram ይምረጡ።"
                : "Choose SMS or Telegram alerts for every delivery step."}
            </p>
            <div className="space-y-3">
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                placeholder={
                  language === "am" ? "ለSMS ስልክ ቁጥር" : "Phone number for SMS"
                }
                value={smsPhone}
                onChange={(event) => setSmsPhone(event.target.value)}
              />
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                placeholder={
                  language === "am" ? "Telegram የተጠቃሚ ስም" : "Telegram username"
                }
                value={telegramUser}
                onChange={(event) => setTelegramUser(event.target.value)}
              />
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                placeholder={
                  language === "am" ? "ኢሜይል አድራሻ" : "Email address"
                }
                value={emailAddress}
                onChange={(event) => setEmailAddress(event.target.value)}
              />
              <div className="grid gap-2">
                <button
                  className="w-full rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                  onClick={() => sendNotificationStub("SMS")}
                >
                  {language === "am" ? "SMS አንቀሳቅስ" : "Enable SMS updates"}
                </button>
                <button
                  className="w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  onClick={() => sendNotificationStub("TELEGRAM")}
                >
                  {language === "am"
                    ? "Telegram አንቀሳቅስ"
                    : "Enable Telegram updates"}
                </button>
                <button
                  className="w-full rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                  onClick={() => sendNotificationStub("EMAIL")}
                >
                  {language === "am"
                    ? "ኢሜይል አንቀሳቅስ"
                    : "Enable Email updates"}
                </button>
              </div>
              {notifyMessage && (
                <p className="text-xs text-emerald-600">{notifyMessage}</p>
              )}
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700">
              {language === "am"
                ? "ማስታወቂያዎች ለማረጋገጫ፣ ለመላክ እና ለመድረስ ይላካሉ።"
                : "Updates are sent for order confirmation, dispatch, and delivery."}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
