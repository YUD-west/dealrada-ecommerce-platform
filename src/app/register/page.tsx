"use client";

import Link from "next/link";
import { useState } from "react";
import AuthPageTopBar from "@/components/AuthPageTopBar";
import PasswordField from "@/components/PasswordField";
import { validateEmail, validateName, validateNewPassword } from "@/lib/validation";

type AuthUser = {
  id: number;
  name: string;
  email: string | null;
  role: string;
};

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);

    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }

    const nameErr = validateName(name);
    if (nameErr) {
      setMessage(nameErr);
      return;
    }
    const emailErr = validateEmail(email);
    if (emailErr) {
      setMessage(emailErr);
      return;
    }
    const passErr = validateNewPassword(password);
    if (passErr) {
      setMessage(passErr);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });
      const data = (await response.json().catch(() => null)) as
        | { error?: string; user?: AuthUser }
        | null;

      if (!response.ok) {
        throw new Error(data?.error ?? "Registration failed.");
      }

      // Full navigation so the session cookie is always applied before the next page load.
      window.location.assign("/");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthPageTopBar variant="register" />
      <div className="min-h-[calc(100dvh-3.5rem)] bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-md flex-col gap-6 px-6 py-16">
        <div>
          <h1 className="text-2xl font-semibold">Create account</h1>
          <p className="text-sm text-slate-500">
            Sign up with your email to shop on DealArada.
          </p>
        </div>

        <form
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="reg-name">
              Name
            </label>
            <input
              id="reg-name"
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="reg-email">
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <PasswordField
            id="reg-password"
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="8+ chars, 1 letter & 1 number"
            autoComplete="new-password"
            minLength={8}
            required
            toggleContext="password"
          />
          <PasswordField
            id="reg-confirm"
            label="Confirm password"
            value={confirm}
            onChange={setConfirm}
            placeholder="Repeat password"
            autoComplete="new-password"
            minLength={8}
            required
            toggleContext="confirmation"
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
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Sign in
            </Link>
          </p>
        </form>

        <p className="text-center text-xs text-slate-500">
          Want to sell on DealArada?{" "}
          <Link href="/seller" className="text-emerald-700 hover:underline">
            Apply as a seller
          </Link>
        </p>
      </div>
    </div>
    </>
  );
}
