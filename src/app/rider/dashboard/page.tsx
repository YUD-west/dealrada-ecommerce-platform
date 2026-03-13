"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NotificationBell from "@/components/NotificationBell";

type DeliveryOrder = {
  id: string;
  customer: string;
  total: number;
  currency: string;
  status: string;
  placedAt: string;
  address?: string | null;
  riderName?: string | null;
  deliveryStatus?: string | null;
};

const deliverySteps = [
  "UNASSIGNED",
  "ASSIGNED",
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export default function RiderDashboardPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ role?: string; name?: string } | null>(
    null
  );
  const [authLoading, setAuthLoading] = useState(true);
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [riderName, setRiderName] = useState("Rider");

  const loadOrders = async () => {
    try {
      const response = await fetch("/api/delivery/orders");
      if (!response.ok) return;
      const data = (await response.json()) as { items: DeliveryOrder[] };
      setOrders(data.items);
    } catch {
      // Ignore load errors.
    }
  };

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          setAuth(null);
          setAuthLoading(false);
          return;
        }
        const data = (await response.json()) as {
          user: { role: string; name: string };
        };
        setAuth(data.user);
        setRiderName(data.user.name ?? "Rider");
      } catch {
        setAuth(null);
      } finally {
        setAuthLoading(false);
      }
    };
    loadAuth();
    loadOrders();
  }, []);

  const assignOrder = async (orderId: string) => {
    try {
      await fetch(`/api/delivery/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          riderName,
          deliveryStatus: "ASSIGNED",
        }),
      });
      await loadOrders();
    } catch {
      // Ignore.
    }
  };

  const updateDelivery = async (
    orderId: string,
    deliveryStatus: string
  ) => {
    try {
      await fetch(`/api/delivery/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryStatus,
          status: deliveryStatus === "DELIVERED" ? "DELIVERED" : undefined,
        }),
      });
      await loadOrders();
    } catch {
      // Ignore.
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
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
              href="/track"
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-emerald-200"
            >
              Track order
            </Link>
            <NotificationBell />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        {authLoading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
            Checking access...
          </div>
        )}
        {!authLoading && !auth && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600 shadow-sm">
            You need to sign in as a rider to access this page.{" "}
            <Link href="/login" className="font-semibold">
              Go to login
            </Link>
          </div>
        )}
        {!authLoading && auth?.role !== "RIDER" && auth && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600 shadow-sm">
            Access denied. Rider role required.
          </div>
        )}
        {!authLoading && auth?.role === "RIDER" && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-emerald-600">
                  Delivery dashboard
                </p>
                <h1 className="text-3xl font-semibold">Rider operations</h1>
                <p className="text-sm text-slate-500">
                  Assign orders and update delivery status.
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span>Signed in as {auth?.name}</span>
                <button
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-emerald-200"
                  onClick={handleLogout}
                >
                  Sign out
                </button>
              </div>
            </div>

            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Active deliveries</h2>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500">Rider name</span>
                  <input
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    value={riderName}
                    onChange={(event) => setRiderName(event.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{order.id}</p>
                        <p className="text-xs text-slate-500">
                          {order.customer} • {order.address ?? "Woliso"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {order.total.toLocaleString()} {order.currency}
                        </p>
                        <p className="text-xs text-slate-500">
                          {order.deliveryStatus ?? "UNASSIGNED"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <button
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-emerald-200"
                        onClick={() => assignOrder(order.id)}
                      >
                        Assign to me
                      </button>
                      <select
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        value={order.deliveryStatus ?? "UNASSIGNED"}
                        onChange={(event) =>
                          updateDelivery(order.id, event.target.value)
                        }
                      >
                        {deliverySteps.map((step) => (
                          <option key={step} value={step}>
                            {step}
                          </option>
                        ))}
                      </select>
                      <span className="text-xs text-slate-500">
                        Assigned: {order.riderName ?? "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
