"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NotificationBell from "@/components/NotificationBell";

const initialProducts = [
  { id: 1, name: "Premium running shoes", status: "Approved", stock: 6 },
  { id: 2, name: "Luxury wrist watch", status: "Pending", stock: 2 },
  { id: 3, name: "Bluetooth speaker", status: "Approved", stock: 8 },
];

export default function AdminPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ role?: string; name?: string } | null>(
    null
  );
  const [authLoading, setAuthLoading] = useState(true);
  const [users, setUsers] = useState<
    Array<{
      id: number;
      name: string;
      role: string;
      status: string;
      sellerId: number | null;
    }>
  >([]);
  const [products, setProducts] = useState(initialProducts);
  const [productStats, setProductStats] = useState({
    pending: 0,
    approved: 0,
  });
  const [disputes, setDisputes] = useState<
    Array<{ id: string; issue: string; status: string }>
  >([]);
  const [disputeFilters, setDisputeFilters] = useState({
    status: "",
    search: "",
  });
  const [disputeForm, setDisputeForm] = useState({
    issue: "",
  });
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);
  const [inventoryAdjustments, setInventoryAdjustments] = useState<
    Array<{
      id: number;
      productName: string;
      change: number;
      reason: string;
      orderId: number | null;
      createdAt: string;
    }>
  >([]);
  const [inventoryStats, setInventoryStats] = useState({
    totalCount: 0,
    totalChange: 0,
    orderCount: 0,
    manualCount: 0,
    orderChange: 0,
    manualChange: 0,
    daily: [] as Array<{ day: string; count: number; change: number }>,
  });
  const [paymentMethods, setPaymentMethods] = useState<
    Array<{
      id: string;
      label: string;
      enabled: boolean;
      sortOrder: number;
    }>
  >([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [inventoryFilters, setInventoryFilters] = useState({
    product: "",
    reason: "",
    orderId: "",
    from: "",
    to: "",
  });
  const [inventoryOffset, setInventoryOffset] = useState(0);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [analytics, setAnalytics] = useState({
    gmv: 0,
    orders: 0,
    avgOrder: 0,
    pendingProducts: 0,
    activeSellers: 0,
    openDisputes: 0,
  });
  const [promotions, setPromotions] = useState<
    Array<{
      id: number;
      code: string;
      type: string;
      value: number;
      startsAt: string | null;
      endsAt: string | null;
      status: string;
    }>
  >([]);
  const [promoForm, setPromoForm] = useState({
    code: "",
    type: "PERCENT",
    value: "",
    startsAt: "",
    endsAt: "",
  });
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [pendingReviews, setPendingReviews] = useState<
    Array<{
      id: number;
      author: string;
      productName: string;
      rating: number;
      note: string;
      photoUrl?: string | null;
      createdAt: string;
    }>
  >([]);

  const updateUserStatus = async (
    sellerId: number | null,
    status: string
  ) => {
    if (!sellerId) return;
    setUsers((prev) =>
      prev.map((user) =>
        user.sellerId === sellerId ? { ...user, status } : user
      )
    );
    try {
      await fetch(`/api/admin/sellers/${sellerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: status.toUpperCase(),
        }),
      });
    } catch {
      // Keep UI responsive even if API fails.
    }
  };

  const updateProductStatus = async (id: number, status: string) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, status } : product
      )
    );
    try {
      await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: status.toUpperCase(),
        }),
      });
    } catch {
      // Keep UI responsive even if API fails.
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch("/api/seller/products");
      if (!response.ok) return;
      const data = (await response.json()) as {
        items: Array<{ id: number; name: string; status: string; stock: number }>;
      };
      setProducts(
        data.items.map((item) => ({
          id: item.id,
          name: item.name,
          status: item.status,
          stock: item.stock,
        }))
      );
    } catch {
      // Keep fallback if API fails.
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) return;
      const data = (await response.json()) as {
        items: Array<{
          id: number;
          name: string;
          role: string;
          status: string;
          sellerId: number | null;
        }>;
      };
      setUsers(data.items);
    } catch {
      // Keep fallback if API fails.
    }
  };

  const submitDispute = async () => {
    const issue = disputeForm.issue.trim();
    if (!issue) return;
    setDisputeSubmitting(true);
    try {
      const response = await fetch("/api/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issue }),
      });
      if (!response.ok) return;
      setDisputeForm({ issue: "" });
      loadDisputes();
    } catch {
      // Keep UI responsive even if API fails.
    } finally {
      setDisputeSubmitting(false);
    }
  };

  const filteredDisputes = disputes.filter((ticket) => {
    if (
      disputeFilters.status &&
      ticket.status.toLowerCase() !== disputeFilters.status.toLowerCase()
    ) {
      return false;
    }
    if (
      disputeFilters.search &&
      !ticket.issue.toLowerCase().includes(disputeFilters.search.toLowerCase()) &&
      !ticket.id.toLowerCase().includes(disputeFilters.search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const loadProductStats = async () => {
    try {
      const response = await fetch("/api/admin/products/stats");
      if (!response.ok) return;
      const data = (await response.json()) as {
        pending?: number;
        approved?: number;
      };
      setProductStats({
        pending: data.pending ?? 0,
        approved: data.approved ?? 0,
      });
      setAnalytics((prev) => ({
        ...prev,
        pendingProducts: data.pending ?? prev.pendingProducts,
      }));
    } catch {
      // Keep fallback if API fails.
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch("/api/orders");
      if (!response.ok) return;
      const data = (await response.json()) as {
        items: Array<{ total: number; status: string }>;
      };
      const orderCount = data.items.length;
      const gmv = data.items.reduce((sum, item) => sum + item.total, 0);
      setAnalytics((prev) => ({
        ...prev,
        gmv,
        orders: orderCount,
        avgOrder: orderCount ? Math.round(gmv / orderCount) : 0,
      }));
    } catch {
      // Keep fallback stats if API fails.
    }
  };

  const loadPromotions = async () => {
    try {
      const response = await fetch("/api/admin/promotions");
      if (!response.ok) return;
      const data = (await response.json()) as {
        items: Array<{
          id: number;
          code: string;
          type: string;
          value: number;
          startsAt: string | null;
          endsAt: string | null;
          status: string;
        }>;
      };
      setPromotions(data.items);
    } catch {
      // Keep fallback if API fails.
    }
  };

  const loadPendingReviews = async () => {
    try {
      const response = await fetch("/api/admin/reviews");
      if (!response.ok) return;
      const data = (await response.json()) as {
        items: Array<{
          id: number;
          author: string;
          productName: string;
          rating: number;
          note: string;
          photoUrl?: string | null;
          createdAt: string;
        }>;
      };
      setPendingReviews(data.items);
    } catch {
      // Keep fallback if API fails.
    }
  };

  const resolveDispute = async (id: string) => {
    setDisputes((prev) =>
      prev.map((ticket) =>
        ticket.id === id ? { ...ticket, status: "Resolved" } : ticket
      )
    );
    try {
      await fetch(`/api/admin/disputes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED" }),
      });
    } catch {
      // Keep UI responsive even if API fails.
    }
  };
  const loadDisputes = async () => {
    try {
      const response = await fetch("/api/admin/disputes");
      if (!response.ok) return;
      const data = (await response.json()) as {
        items: Array<{ id: string; issue: string; status: string }>;
      };
      setDisputes(data.items);
    } catch {
      // Keep fallback if API fails.
    }
  };

  const loadInventoryAdjustments = async (
    {
      reset,
      append,
    }: { reset?: boolean; append?: boolean } = { reset: false, append: false }
  ) => {
    try {
      setInventoryLoading(true);
      const params = new URLSearchParams();
      if (inventoryFilters.product.trim()) {
        params.set("product", inventoryFilters.product.trim());
      }
      if (inventoryFilters.reason.trim()) {
        params.set("reason", inventoryFilters.reason.trim());
      }
      if (inventoryFilters.orderId.trim()) {
        params.set("orderId", inventoryFilters.orderId.trim());
      }
      if (inventoryFilters.from) {
        const fromDate = new Date(inventoryFilters.from);
        if (!Number.isNaN(fromDate.getTime())) {
          params.set("from", fromDate.toISOString());
        }
      }
      if (inventoryFilters.to) {
        const toDate = new Date(`${inventoryFilters.to}T23:59:59.999`);
        if (!Number.isNaN(toDate.getTime())) {
          params.set("to", toDate.toISOString());
        }
      }
      params.set("limit", "20");
      const nextOffset = reset ? 0 : inventoryOffset;
      params.set("offset", String(nextOffset));

      const response = await fetch(
        `/api/admin/inventory/adjustments?${params.toString()}`
      );
      if (!response.ok) return;
      const data = (await response.json()) as {
        items: Array<{
          id: number;
          productName: string;
          change: number;
          reason: string;
          orderId: number | null;
          createdAt: string;
        }>;
      };
      if (append) {
        setInventoryAdjustments((prev) => [...prev, ...data.items]);
      } else {
        setInventoryAdjustments(data.items);
      }
      setInventoryOffset(nextOffset + data.items.length);
    } catch {
      // Keep fallback if API fails.
    } finally {
      setInventoryLoading(false);
    }
  };

  const loadInventoryStats = async () => {
    try {
      const response = await fetch("/api/admin/inventory/adjustments/stats");
      if (!response.ok) return;
      const data = (await response.json()) as {
        totalCount: number;
        totalChange: number;
        orderCount: number;
        manualCount: number;
        orderChange: number;
        manualChange: number;
        daily: Array<{ day: string; count: number; change: number }>;
      };
      setInventoryStats(data);
    } catch {
      // Keep fallback if API fails.
    }
  };

  const loadPaymentMethods = async () => {
    try {
      setPaymentsLoading(true);
      const response = await fetch("/api/admin/payments");
      if (!response.ok) return;
      const data = (await response.json()) as {
        items: Array<{
          id: string;
          label: string;
          enabled: boolean;
          sortOrder: number;
        }>;
      };
      setPaymentMethods(data.items);
    } catch {
      // Keep fallback if API fails.
    } finally {
      setPaymentsLoading(false);
    }
  };

  const updatePaymentMethod = async (
    id: string,
    patch: { enabled?: boolean; sortOrder?: number }
  ) => {
    try {
      await fetch(`/api/admin/payments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
    } catch {
      // Ignore API errors for UI responsiveness.
    }
  };

  const deletePaymentMethod = async (id: string) => {
    try {
      await fetch(`/api/admin/payments/${id}`, { method: "DELETE" });
    } catch {
      // Ignore API errors for UI responsiveness.
    }
  };

  const reorderPaymentMethods = async (items: typeof paymentMethods) => {
    try {
      await fetch("/api/admin/payments/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item, index) => ({
            id: item.id,
            sortOrder: index + 1,
          })),
        }),
      });
    } catch {
      // Ignore API errors for UI responsiveness.
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
      } catch {
        setAuth(null);
      } finally {
        setAuthLoading(false);
      }
    };
    loadAuth();
    loadUsers();
    loadProducts();
    loadProductStats();
    loadAnalytics();
    loadDisputes();
    loadInventoryAdjustments({ reset: true });
    loadInventoryStats();
    loadPaymentMethods();
    loadPromotions();
    loadPendingReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setAnalytics((prev) => ({
      ...prev,
      activeSellers: users.filter(
        (user) => user.role === "Seller" && user.status === "Active"
      ).length,
      openDisputes: disputes.filter((ticket) => ticket.status === "Open").length,
    }));
  }, [users, disputes]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const handlePromoChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setPromoForm((prev) => ({ ...prev, [name]: value }));
  };

  const createPromotion = async () => {
    setPromoMessage(null);
    const value = Number(promoForm.value);
    if (!promoForm.code.trim() || Number.isNaN(value) || value <= 0) {
      setPromoMessage("Enter a valid promo code and value.");
      return;
    }
    try {
      const response = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoForm.code,
          type: promoForm.type,
          value,
          startsAt: promoForm.startsAt || null,
          endsAt: promoForm.endsAt || null,
        }),
      });
      if (!response.ok) {
        throw new Error("Unable to create promotion.");
      }
      setPromoMessage("Promotion created.");
      setPromoForm({
        code: "",
        type: "PERCENT",
        value: "",
        startsAt: "",
        endsAt: "",
      });
      loadPromotions();
    } catch (error) {
      setPromoMessage(
        error instanceof Error ? error.message : "Failed to create promotion."
      );
    }
  };

  const updateReviewStatus = async (id: number, status: "APPROVED" | "REJECTED") => {
    try {
      await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setPendingReviews((prev) => prev.filter((review) => review.id !== id));
    } catch {
      // Ignore errors for UI.
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
              href="/seller/dashboard"
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-emerald-200"
            >
              Seller dashboard
            </Link>
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
            You need to sign in as an admin to access this page.{" "}
            <Link href="/login" className="font-semibold">
              Go to login
            </Link>
          </div>
        )}
        {!authLoading && auth?.role !== "ADMIN" && auth && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600 shadow-sm">
            Access denied. Admin role required.
          </div>
        )}
        {!authLoading && auth?.role === "ADMIN" && (
          <>
        <div>
          <p className="text-sm font-semibold text-emerald-600">Admin panel</p>
          <h1 className="text-3xl font-semibold">Platform overview</h1>
          <p className="text-sm text-slate-500">
            Manage sellers, products, and disputes.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span>Signed in as {auth?.name}</span>
            <button
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-emerald-200"
              onClick={handleLogout}
            >
              Sign out
            </button>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Total orders", value: analytics.orders.toLocaleString() },
            {
              label: "Active sellers",
              value: analytics.activeSellers.toLocaleString(),
            },
            {
              label: "Open disputes",
              value: analytics.openDisputes.toLocaleString(),
            },
            {
              label: "Today revenue",
              value: `${analytics.gmv.toLocaleString()} ETB`,
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-xs text-slate-500">{card.label}</p>
              <p className="text-2xl font-semibold">{card.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Analytics snapshot</h2>
              <span className="text-xs text-slate-500">Last 7 days</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">GMV</p>
                <p className="text-lg font-semibold">
                  {analytics.gmv.toLocaleString()} ETB
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Avg order value</p>
                <p className="text-lg font-semibold">
                  {analytics.avgOrder.toLocaleString()} ETB
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Pending products</p>
                <p className="text-lg font-semibold">
                  {analytics.pendingProducts.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-4 h-36 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
              Revenue chart placeholder (connect BI later)
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Operational health</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Fulfillment SLA</span>
                <span className="font-semibold text-emerald-700">92%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">On-time delivery</span>
                <span className="font-semibold text-emerald-700">88%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Refund rate</span>
                <span className="font-semibold text-amber-700">2.4%</span>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                Healthy operations. Keep watch on refunds and response time.
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Users & sellers</h2>
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.name}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm"
                >
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-emerald-200">
                      {user.status}
                    </button>
                    {user.role === "Seller" && user.status !== "Active" && (
                      <button
                        className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                        onClick={() =>
                          updateUserStatus(user.sellerId, "Active")
                        }
                      >
                        Approve
                      </button>
                    )}
                    {user.status === "Active" && (
                      <button
                        className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:border-rose-300"
                        onClick={() =>
                          updateUserStatus(user.sellerId, "Suspended")
                        }
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Disputes</h2>
            <div className="flex flex-wrap items-end gap-3 text-xs text-slate-600">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase text-slate-500">
                  Status
                </label>
                <select
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  value={disputeFilters.status}
                  onChange={(event) =>
                    setDisputeFilters((prev) => ({
                      ...prev,
                      status: event.target.value,
                    }))
                  }
                >
                  <option value="">All</option>
                  <option value="Open">Open</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase text-slate-500">
                  Search
                </label>
                <input
                  className="w-40 rounded-full border border-slate-200 px-3 py-1 text-xs focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  placeholder="Issue or ID"
                  value={disputeFilters.search}
                  onChange={(event) =>
                    setDisputeFilters((prev) => ({
                      ...prev,
                      search: event.target.value,
                    }))
                  }
                />
              </div>
              <button
                className="rounded-full border border-slate-200 px-4 py-1 text-xs font-semibold text-slate-700 transition hover:border-emerald-200"
                onClick={() =>
                  setDisputeFilters({
                    status: "",
                    search: "",
                  })
                }
              >
                Reset
              </button>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">
                New dispute
              </p>
              <div className="mt-2 flex items-center gap-2">
                <input
                  className="flex-1 rounded-full border border-slate-200 px-3 py-2 text-xs focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  placeholder="Describe the issue"
                  value={disputeForm.issue}
                  onChange={(event) =>
                    setDisputeForm({ issue: event.target.value })
                  }
                />
                <button
                  className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  onClick={submitDispute}
                  disabled={disputeSubmitting}
                >
                  {disputeSubmitting ? "Submitting..." : "Create"}
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {filteredDisputes.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm"
                >
                  <div>
                    <p className="font-semibold">{ticket.id}</p>
                    <p className="text-xs text-slate-500">{ticket.issue}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-600">
                      {ticket.status}
                    </span>
                    {ticket.status === "Open" && (
                      <button
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-emerald-200"
                        onClick={() => resolveDispute(ticket.id)}
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Review moderation</h2>
            <span className="text-xs text-slate-500">
              {pendingReviews.length} pending
            </span>
          </div>
          <div className="space-y-3">
            {pendingReviews.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
                No reviews waiting for moderation.
              </div>
            )}
            {pendingReviews.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{review.author}</p>
                    <p className="text-xs text-slate-500">
                      {review.productName} · {review.rating} ⭐
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                      onClick={() => updateReviewStatus(review.id, "APPROVED")}
                    >
                      Approve
                    </button>
                    <button
                      className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:border-rose-300"
                      onClick={() => updateReviewStatus(review.id, "REJECTED")}
                    >
                      Reject
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-600">{review.note}</p>
                {review.photoUrl && (
                  <div className="mt-3 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                    <Image
                      src={review.photoUrl}
                      alt="Review photo"
                      width={320}
                      height={240}
                      className="h-24 w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Promotions</h2>
            <div className="space-y-3">
              {promotions.length === 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
                  No promotions yet.
                </div>
              )}
              {promotions.map((promo) => (
                <div
                  key={promo.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm"
                >
                  <div>
                    <p className="font-semibold">{promo.code}</p>
                    <p className="text-xs text-slate-500">
                      {promo.type === "PERCENT"
                        ? `${promo.value}% off`
                        : `${promo.value} ETB off`}
                    </p>
                  </div>
                  <div className="text-xs text-slate-500">
                    {promo.startsAt
                      ? new Date(promo.startsAt).toLocaleDateString()
                      : "Anytime"}{" "}
                    →{" "}
                    {promo.endsAt
                      ? new Date(promo.endsAt).toLocaleDateString()
                      : "No end"}
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {promo.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Schedule new promo</h2>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
              <div className="grid gap-3">
                <input
                  name="code"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Promo code (e.g., WELCOME5)"
                  value={promoForm.code}
                  onChange={handlePromoChange}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <select
                    name="type"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    value={promoForm.type}
                    onChange={handlePromoChange}
                  >
                    <option value="PERCENT">Percent (%)</option>
                    <option value="FIXED">Fixed (ETB)</option>
                  </select>
                  <input
                    name="value"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Value"
                    value={promoForm.value}
                    onChange={handlePromoChange}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    name="startsAt"
                    type="date"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    value={promoForm.startsAt}
                    onChange={handlePromoChange}
                  />
                  <input
                    name="endsAt"
                    type="date"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    value={promoForm.endsAt}
                    onChange={handlePromoChange}
                  />
                </div>
                <button
                  className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  onClick={createPromotion}
                >
                  Create promotion
                </button>
                {promoMessage && (
                  <p className="text-xs text-emerald-600">{promoMessage}</p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Product moderation</h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="rounded-full border border-slate-200 px-3 py-1">
              Pending: {productStats.pending}
            </span>
            <span className="rounded-full border border-slate-200 px-3 py-1">
              Approved: {productStats.approved}
            </span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-3 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
              <span>Product</span>
              <span>Stock</span>
              <span>Status</span>
            </div>
            {products.map((product) => (
              <div
                key={product.id}
                className="grid grid-cols-3 gap-4 border-b border-slate-100 px-4 py-3 text-sm"
              >
                <span className="font-semibold">{product.name}</span>
                <span>{product.stock} units</span>
                <div className="flex items-center gap-2">
                  {(() => {
                    const statusUpper = product.status.toUpperCase();
                    return (
                      <>
                        <span className="text-xs text-slate-500">
                          {statusUpper}
                        </span>
                        {statusUpper !== "APPROVED" && (
                    <button
                      className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                      onClick={() =>
                        updateProductStatus(product.id, "Approved")
                      }
                    >
                      Approve
                    </button>
                        )}
                        {statusUpper === "APPROVED" && (
                    <button
                      className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:border-rose-300"
                      onClick={() =>
                        updateProductStatus(product.id, "Rejected")
                      }
                    >
                      Reject
                    </button>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Inventory adjustments</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                label: "Total adjustments",
                value: inventoryStats.totalCount,
              },
              {
                label: "Net stock change",
                value:
                  inventoryStats.totalChange > 0
                    ? `+${inventoryStats.totalChange}`
                    : inventoryStats.totalChange,
              },
              {
                label: "Order vs manual",
                value: `${inventoryStats.orderCount} / ${inventoryStats.manualCount}`,
              },
            ].map((card) => (
              <div
                key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm"
              >
                <p className="text-xs text-slate-500">{card.label}</p>
                <p className="text-xl font-semibold">{card.value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Last 7 days (net change)
            </p>
            <div className="mt-3 space-y-2 text-xs text-slate-600">
              {(() => {
                const today = new Date();
                const days: Array<{ day: string; label: string }> = [];
                for (let i = 6; i >= 0; i -= 1) {
                  const d = new Date(today);
                  d.setDate(today.getDate() - i);
                  const day = d.toISOString().slice(0, 10);
                  days.push({
                    day,
                    label: d.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    }),
                  });
                }
                const map = new Map(
                  inventoryStats.daily.map((item) => [item.day, item.change])
                );
                const values = days.map((item) => map.get(item.day) ?? 0);
                const maxAbs =
                  values.length === 0
                    ? 0
                    : Math.max(...values.map((v) => Math.abs(v)), 1);
                return days.map((item, index) => {
                  const value = values[index];
                  const width = `${Math.round((Math.abs(value) / maxAbs) * 100)}%`;
                  return (
                    <div
                      key={item.day}
                      className="flex items-center gap-3"
                    >
                      <span className="w-16 text-[11px] text-slate-500">
                        {item.label}
                      </span>
                      <div className="flex-1 rounded-full bg-slate-100">
                        <div
                          className={
                            value < 0
                              ? "h-2 rounded-full bg-rose-400"
                              : "h-2 rounded-full bg-emerald-400"
                          }
                          style={{ width }}
                        />
                      </div>
                      <span className="w-14 text-right text-[11px] text-slate-500">
                        {value > 0 ? `+${value}` : value}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-3 text-xs text-slate-600">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-slate-500">
                Product
              </label>
              <input
                className="w-48 rounded-full border border-slate-200 px-3 py-1 text-xs focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                placeholder="Search product"
                value={inventoryFilters.product}
                onChange={(event) =>
                  setInventoryFilters((prev) => ({
                    ...prev,
                    product: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-slate-500">
                Reason
              </label>
              <select
                className="rounded-full border border-slate-200 px-3 py-1 text-xs focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                value={inventoryFilters.reason}
                onChange={(event) =>
                  setInventoryFilters((prev) => ({
                    ...prev,
                    reason: event.target.value,
                  }))
                }
              >
                <option value="">All</option>
                <option value="ORDER">Order</option>
                <option value="MANUAL">Manual</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-slate-500">
                Order ID
              </label>
              <input
                className="w-32 rounded-full border border-slate-200 px-3 py-1 text-xs focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                placeholder="e.g. 12"
                value={inventoryFilters.orderId}
                onChange={(event) =>
                  setInventoryFilters((prev) => ({
                    ...prev,
                    orderId: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-slate-500">
                From
              </label>
              <input
                className="rounded-full border border-slate-200 px-3 py-1 text-xs focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                type="date"
                value={inventoryFilters.from}
                onChange={(event) =>
                  setInventoryFilters((prev) => ({
                    ...prev,
                    from: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-slate-500">
                To
              </label>
              <input
                className="rounded-full border border-slate-200 px-3 py-1 text-xs focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                type="date"
                value={inventoryFilters.to}
                onChange={(event) =>
                  setInventoryFilters((prev) => ({
                    ...prev,
                    to: event.target.value,
                  }))
                }
              />
            </div>
            <button
              className="rounded-full border border-slate-200 px-4 py-1 text-xs font-semibold text-slate-700 transition hover:border-emerald-200"
              onClick={() => {
                setInventoryOffset(0);
                loadInventoryAdjustments({ reset: true });
              }}
              disabled={inventoryLoading}
            >
              {inventoryLoading ? "Loading..." : "Apply"}
            </button>
            <button
              className="rounded-full border border-slate-200 px-4 py-1 text-xs font-semibold text-slate-700 transition hover:border-emerald-200"
              onClick={() => {
                setInventoryFilters({
                  product: "",
                  reason: "",
                  orderId: "",
                  from: "",
                  to: "",
                });
                setInventoryOffset(0);
                loadInventoryAdjustments({ reset: true });
              }}
              disabled={inventoryLoading}
            >
              Reset
            </button>
            <button
              className="rounded-full border border-slate-200 px-4 py-1 text-xs font-semibold text-slate-700 transition hover:border-emerald-200"
              onClick={() => {
                const params = new URLSearchParams();
                if (inventoryFilters.product.trim()) {
                  params.set("product", inventoryFilters.product.trim());
                }
                if (inventoryFilters.reason.trim()) {
                  params.set("reason", inventoryFilters.reason.trim());
                }
                if (inventoryFilters.orderId.trim()) {
                  params.set("orderId", inventoryFilters.orderId.trim());
                }
                if (inventoryFilters.from) {
                  const fromDate = new Date(inventoryFilters.from);
                  if (!Number.isNaN(fromDate.getTime())) {
                    params.set("from", fromDate.toISOString());
                  }
                }
                if (inventoryFilters.to) {
                  const toDate = new Date(`${inventoryFilters.to}T23:59:59.999`);
                  if (!Number.isNaN(toDate.getTime())) {
                    params.set("to", toDate.toISOString());
                  }
                }
                params.set("format", "csv");
                window.open(
                  `/api/admin/inventory/adjustments?${params.toString()}`,
                  "_blank"
                );
              }}
              disabled={inventoryLoading}
            >
              Export CSV
            </button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-4 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
              <span>Product</span>
              <span>Change</span>
              <span>Reason</span>
              <span>When</span>
            </div>
            {inventoryAdjustments.length === 0 && (
              <div className="px-4 py-4 text-sm text-slate-500">
                No inventory adjustments yet.
              </div>
            )}
            {inventoryAdjustments.map((entry) => (
              <div
                key={entry.id}
                className="grid grid-cols-4 gap-4 border-b border-slate-100 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold">{entry.productName}</p>
                  {entry.orderId && (
                    <p className="text-xs text-slate-500">
                      Order #{entry.orderId}
                    </p>
                  )}
                </div>
                <span
                  className={
                    entry.change < 0 ? "text-rose-600" : "text-emerald-600"
                  }
                >
                  {entry.change > 0 ? `+${entry.change}` : entry.change}
                </span>
                <span className="text-xs uppercase text-slate-500">
                  {entry.reason}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(entry.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div>
            <button
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-200"
              onClick={() => loadInventoryAdjustments({ append: true })}
              disabled={inventoryLoading}
            >
              {inventoryLoading ? "Loading..." : "Load more"}
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Payment methods</h2>
            <button
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-200"
              onClick={loadPaymentMethods}
              disabled={paymentsLoading}
            >
              {paymentsLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-[1.2fr_0.7fr_0.6fr] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
              <span>Method</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {paymentMethods.length === 0 && (
              <div className="px-4 py-4 text-sm text-slate-500">
                No payment methods found.
              </div>
            )}
            {paymentMethods.map((method, index) => (
              <div
                key={method.id}
                className="grid grid-cols-[1.2fr_0.7fr_0.6fr] gap-4 border-b border-slate-100 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold">{method.label}</p>
                  <p className="text-xs text-slate-500">{method.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-emerald-200"
                    onClick={async () => {
                      setPaymentMethods((prev) =>
                        prev.map((item) =>
                          item.id === method.id
                            ? { ...item, enabled: !item.enabled }
                            : item
                        )
                      );
                      await updatePaymentMethod(method.id, {
                        enabled: !method.enabled,
                      });
                    }}
                  >
                    {method.enabled ? "Enabled" : "Disabled"}
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700 transition hover:border-emerald-200"
                    disabled={index === 0}
                    onClick={async () => {
                      const next = [...paymentMethods];
                      [next[index - 1], next[index]] = [
                        next[index],
                        next[index - 1],
                      ];
                      setPaymentMethods(next);
                      await reorderPaymentMethods(next);
                    }}
                  >
                    Up
                  </button>
                  <button
                    className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700 transition hover:border-emerald-200"
                    disabled={index === paymentMethods.length - 1}
                    onClick={async () => {
                      const next = [...paymentMethods];
                      [next[index + 1], next[index]] = [
                        next[index],
                        next[index + 1],
                      ];
                      setPaymentMethods(next);
                      await reorderPaymentMethods(next);
                    }}
                  >
                    Down
                  </button>
                  <button
                    className="rounded-full border border-rose-200 px-3 py-1 font-semibold text-rose-600 transition hover:border-rose-300"
                    onClick={async () => {
                      setPaymentMethods((prev) =>
                        prev.filter((item) => item.id !== method.id)
                      );
                      await deletePaymentMethod(method.id);
                    }}
                  >
                    Delete
                  </button>
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
