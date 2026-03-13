 "use client";

import Link from "next/link";
import { useState } from "react";

const steps = [
  "Submit shop info and product list",
  "Verification and onboarding call",
  "Start receiving orders daily",
];

export default function SellerPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    location: "",
    category: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setSubmitting(true);
    setCredentials(null);
    try {
      const response = await fetch("/api/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json().catch(() => null)) as
        | { error?: string; credentials?: { email: string; password: string } }
        | null;
      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to submit application.");
      }
      if (data?.credentials) {
        setCredentials(data.credentials);
      }
      setMessage("Application submitted. Use the demo credentials below.");
      setForm({
        name: "",
        phone: "",
        location: "",
        category: "",
      });
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to submit application."
      );
    } finally {
      setSubmitting(false);
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
            <Link href="/categories">Shop</Link>
            <Link href="/checkout">Contact</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <div>
            <p className="text-sm font-semibold text-emerald-600">
              Sell on DealArada
            </p>
            <h1 className="text-3xl font-semibold">
              Bring more customers to your shop
            </h1>
            <p className="mt-2 text-slate-600">
              Zero upfront cost. We list your products and deliver for you.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold">How it works</h2>
            <ul className="space-y-2 text-sm text-slate-600">
              {steps.map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <aside className="space-y-4 rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold">Seller signup</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Shop name</label>
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                placeholder="Your shop name"
                name="name"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Owner phone</label>
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                placeholder="+251 9xx xxx xxx"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Shop location</label>
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                placeholder="Kebele, landmark"
                name="location"
                value={form.location}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Product focus</label>
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                placeholder="Groceries, fashion, electronics..."
                name="category"
                value={form.category}
                onChange={handleChange}
              />
            </div>
            {message && (
              <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </div>
            )}
            {credentials && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <p className="text-xs uppercase text-emerald-600">
                  Demo credentials
                </p>
                <p>Email: {credentials.email}</p>
                <p>Password: {credentials.password}</p>
              </div>
            )}
            <button className="w-full rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white">
              {submitting ? "Submitting..." : "Submit application"}
            </button>
            <p className="text-xs text-slate-500">
              We will create your demo login and show it after submission.
            </p>
            <p className="text-xs text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-emerald-700">
                Sign in
              </Link>
            </p>
          </form>
        </aside>
      </main>
    </div>
  );
}
