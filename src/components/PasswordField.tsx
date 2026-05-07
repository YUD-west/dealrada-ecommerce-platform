"use client";

import { useId, useRef, useState } from "react";

type PasswordFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  minLength?: number;
  required?: boolean;
  id?: string;
  /** Accessible label for the toggle (e.g. "password" / "confirm password"). */
  toggleContext?: string;
};

const inputClassName =
  "w-full rounded-xl border border-slate-200 py-2 pl-4 pr-16 text-sm focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100";

export default function PasswordField({
  label,
  value,
  onChange,
  placeholder = "••••••••",
  autoComplete = "current-password",
  minLength,
  required,
  id: idProp,
  toggleContext = "password",
}: PasswordFieldProps) {
  const uid = useId();
  const id = idProp ?? `pw-${uid}`;
  const [visible, setVisible] = useState(false);
  const activeInputRef = useRef<HTMLInputElement | null>(null);
  const showLabel = `Show ${toggleContext}`;
  const hideLabel = `Hide ${toggleContext}`;

  const shared = {
    id,
    className: inputClassName,
    placeholder,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange(e.target.value),
    minLength,
    required,
    autoCorrect: "off" as const,
    autoCapitalize: "off" as const,
    spellCheck: false as const,
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        {visible ? (
          <input
            key={`${id}-text`}
            type="text"
            {...shared}
            ref={activeInputRef}
            autoComplete="off"
          />
        ) : (
          <input
            key={`${id}-password`}
            type="password"
            {...shared}
            ref={activeInputRef}
            autoComplete={autoComplete}
          />
        )}
        <button
          type="button"
          className="absolute inset-y-0 right-0 z-20 flex min-w-[3.25rem] cursor-pointer select-none items-center justify-center rounded-r-xl bg-white/80 px-2 text-xs font-semibold text-slate-700 shadow-[inset_1px_0_0_0_rgb(226_232_240)] backdrop-blur-[2px] transition hover:bg-slate-50 hover:text-slate-900"
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setVisible((v) => !v);
            // After commit, ref attaches to the newly mounted input (swap password ↔ text).
            setTimeout(() => activeInputRef.current?.focus(), 0);
          }}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}
