"use client";

import { useEffect, useState } from "react";

type NotificationItem = {
  id: number;
  message: string;
  channel: string;
  status: string;
  createdAt: string;
};

export default function NotificationBell() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);

  const loadNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      if (!response.ok) return;
      const data = (await response.json()) as {
        items: NotificationItem[];
      };
      setItems(data.items);
    } catch {
      // Ignore notification errors.
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = items.length;

  return (
    <div className="relative">
      <button
        className="relative rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-3 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Notifications</span>
            <button
              className="text-emerald-600"
              onClick={() => {
                setOpen(false);
              }}
            >
              Close
            </button>
          </div>
          <div className="space-y-2">
            {items.length === 0 && (
              <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
                No new updates.
              </p>
            )}
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-100 px-3 py-2 text-xs text-slate-600"
              >
                <p className="text-[11px] uppercase text-slate-400">
                  {item.channel}
                </p>
                <p className="mt-1 text-sm text-slate-700">{item.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
