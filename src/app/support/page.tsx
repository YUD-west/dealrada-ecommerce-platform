"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import useLanguage from "@/components/useLanguage";

type DisputeItem = {
  id: string;
  issue: string;
  status: string;
  createdAt: string;
};

export default function SupportPage() {
  const language = useLanguage();
  const [issue, setIssue] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const t =
    language === "am"
      ? {
          title: "ድጋፍ",
          subtitle: "ጥያቄ ወይም ቅሬታ ያስገቡ እና እኛ እንመልስልዎታለን።",
          faq: "ብዙ ጊዜ የሚጠየቁ ጥያቄዎች",
          contact: "የእኛን ቡድን ያግኙ",
          disputeTitle: "ቅሬታ / ውይይት ክፍት",
          issueLabel: "ችግርዎን ይግለጹ",
          issuePlaceholder: "ለምሳሌ፣ የትዕዛዝ ቁጥር DA-1023 የሚገኙ ችግሮች...",
          submit: "ቅሬታ ያስገቡ",
          recent: "ቅርብ የተከፈቱ ጉዳዮች",
        }
      : {
          title: "Support",
          subtitle: "Submit a question or dispute and we will respond quickly.",
          faq: "Frequently asked questions",
          contact: "Contact our team",
          disputeTitle: "Open a dispute",
          issueLabel: "Describe your issue",
          issuePlaceholder:
            "Example: Order DA-1023 arrived late or missing item...",
          submit: "Submit dispute",
          recent: "Recent tickets",
        };

  const loadDisputes = async () => {
    try {
      const response = await fetch("/api/disputes");
      if (!response.ok) return;
      const data = (await response.json()) as { items: DisputeItem[] };
      setDisputes(data.items);
    } catch {
      // Ignore API errors for UI.
    }
  };

  useEffect(() => {
    loadDisputes();
  }, []);

  const submitDispute = async () => {
    setMessage(null);
    const trimmed = issue.trim();
    if (!trimmed) {
      setMessage("Please describe the issue.");
      return;
    }
    try {
      const response = await fetch("/api/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issue: trimmed }),
      });
      if (!response.ok) {
        throw new Error("Unable to submit dispute.");
      }
      setIssue("");
      setMessage("Your ticket has been created.");
      loadDisputes();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to submit ticket."
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold">
            DealArada
          </Link>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Link href="/track">Track order</Link>
            <Link href="/cart">Cart</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        <div>
          <h1 className="text-2xl font-semibold">{t.title}</h1>
          <p className="text-sm text-slate-500">{t.subtitle}</p>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{t.disputeTitle}</h2>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <label className="text-sm font-semibold">{t.issueLabel}</label>
              <textarea
                className="mt-2 min-h-[120px] w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                placeholder={t.issuePlaceholder}
                value={issue}
                onChange={(event) => setIssue(event.target.value)}
              />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  onClick={submitDispute}
                >
                  {t.submit}
                </button>
                {message && (
                  <span className="text-xs text-emerald-600">{message}</span>
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm">
              <h3 className="text-sm font-semibold">{t.recent}</h3>
              <div className="mt-3 space-y-3">
                {disputes.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                  >
                    <p className="text-xs text-slate-500">{item.id}</p>
                    <p className="text-sm font-semibold">{item.issue}</p>
                    <p className="text-xs text-slate-400">
                      {item.status} ·{" "}
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {disputes.length === 0 && (
                  <p className="text-xs text-slate-400">
                    No tickets found yet.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm">
              <h2 className="text-lg font-semibold">{t.contact}</h2>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>📞 +251 900 000 000</p>
                <p>💬 Telegram: @DealAradaSupport</p>
                <p>✉️ support@dealarada.local</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm">
              <h2 className="text-lg font-semibold">{t.faq}</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>• How do I change my delivery address?</li>
                <li>• What if a product is missing or damaged?</li>
                <li>• How long do refunds take?</li>
                <li>• How can I contact the seller?</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
