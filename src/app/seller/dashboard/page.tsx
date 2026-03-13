"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useLanguage from "@/components/useLanguage";
import NotificationBell from "@/components/NotificationBell";
import { translateOrderStatus } from "@/lib/i18n";

const initialOrders = [
  { id: "DA-1023", customer: "Abel T.", total: "1,450 ETB", status: "Packed" },
  { id: "DA-1024", customer: "Sofia K.", total: "890 ETB", status: "New" },
  { id: "DA-1025", customer: "Hana M.", total: "2,180 ETB", status: "Dispatched" },
];

const initialInventory = [
  { name: "Premium running shoes", stock: 6, price: "2,180 ETB" },
  { name: "Bluetooth speaker", stock: 8, price: "1,350 ETB" },
  { name: "Women’s handbag", stock: 6, price: "780 ETB" },
  { name: "Executive leather shoes", stock: 3, price: "2,870 ETB" },
];

const payoutsFallback = [
  { id: 1, date: "Feb 10", amount: "6,520 ETB", status: "Paid" },
  { id: 2, date: "Feb 05", amount: "3,480 ETB", status: "Paid" },
  { id: 3, date: "Feb 01", amount: "2,160 ETB", status: "Pending" },
];

const productCategoryOptions = [
  "Fashion",
  "Electronics",
  "Home & Kitchen",
  "Beauty",
  "Kids",
  "Accessories",
  "Grocery",
  "Other",
];

export default function SellerDashboardPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ role?: string; name?: string } | null>(
    null
  );
  const [authLoading, setAuthLoading] = useState(true);
  const language = useLanguage();
  const [orders, setOrders] = useState(initialOrders);
  const [inventory, setInventory] = useState(initialInventory);
  const [stockUpdate, setStockUpdate] = useState<Record<string, string>>({});
  const [products, setProducts] = useState<
    Array<{
      id: number;
      name: string;
      nameAm?: string | null;
      description: string;
      descriptionAm?: string | null;
      price: number;
      category: string;
      stock: number;
      image: string;
      status: string;
    }>
  >([]);
  const [productForm, setProductForm] = useState({
    name: "",
    nameAm: "",
    description: "",
    descriptionAm: "",
    price: "",
    category: "",
    stock: "",
    image: "",
  });
  const [productMessage, setProductMessage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [affiliateCode] = useState("DA-SHEGER-25");
  const [referralCode] = useState("REF-SHEGER-5");
  const [regionTarget, setRegionTarget] = useState("Woliso");
  const [pushOptIn, setPushOptIn] = useState(false);
  const [aiRecsEnabled, setAiRecsEnabled] = useState(true);
  const [growthMessage, setGrowthMessage] = useState<string | null>(null);
  const [payouts, setPayouts] = useState(payoutsFallback);
  const [payoutForm, setPayoutForm] = useState({
    amount: "",
    method: "Telebirr",
    account: "",
  });
  const [payoutMessage, setPayoutMessage] = useState<string | null>(null);
  const lowStockThreshold = 3;
  const lowStockItems = useMemo(
    () => inventory.filter((item) => item.stock <= lowStockThreshold),
    [inventory, lowStockThreshold]
  );

  const activeOrders = useMemo(() => orders.length, [orders.length]);

  const updateOrderStatus = async (id: string, status: string) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, status } : order))
    );
    try {
      await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch {
      // Keep UI responsive even if API fails.
    }
  };

  const updateStock = (name: string) => {
    const value = Number(stockUpdate[name]);
    if (Number.isNaN(value)) return;
    setInventory((prev) =>
      prev.map((item) =>
        item.name === name ? { ...item, stock: Math.max(value, 0) } : item
      )
    );
  };

  const loadProducts = async () => {
    try {
      const response = await fetch("/api/seller/products");
      if (!response.ok) return;
      const data = (await response.json()) as {
        items: Array<{
          id: number;
          name: string;
          nameAm?: string | null;
          description: string;
          descriptionAm?: string | null;
          price: number;
          category: string;
          stock: number;
          image: string;
          status: string;
        }>;
      };
      setProducts(data.items);
    } catch {
      // Keep fallback if API fails.
    }
  };

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await fetch("/api/orders");
        if (!response.ok) return;
        const data = (await response.json()) as {
          items: Array<{ id: string; customer: string; total: number; status: string }>;
        };
        setOrders(
          data.items.map((item) => ({
            id: item.id,
            customer: item.customer,
            total: `${item.total.toLocaleString()} ETB`,
            status: item.status,
          }))
        );
      } catch {
        // Keep fallback data if API fails.
      }
    };

    const loadInventory = async () => {
      try {
        const response = await fetch("/api/inventory");
        if (!response.ok) return;
        const data = (await response.json()) as {
          items: Array<{ name: string; stock: number }>;
        };
        setInventory((prev) =>
          data.items.map((item) => {
            const match = prev.find((entry) => entry.name === item.name);
            return {
              name: item.name,
              stock: item.stock,
              price: match?.price ?? "—",
            };
          })
        );
      } catch {
        // Keep fallback data if API fails.
      }
    };

    const loadPayouts = async () => {
      try {
        const response = await fetch("/api/seller/payouts");
        if (!response.ok) return;
        const data = (await response.json()) as {
          items: Array<{
            id: number;
            amount: number;
            method: string;
            account: string | null;
            status: string;
            createdAt: string;
          }>;
        };
        if (data.items.length === 0) return;
        setPayouts(
          data.items.map((item) => ({
            id: item.id,
            date: new Date(item.createdAt).toLocaleDateString(),
            amount: `${item.amount.toLocaleString()} ETB`,
            status: item.status === "PENDING" ? "Pending" : "Paid",
          }))
        );
      } catch {
        // Keep fallback payouts if API fails.
      }
    };

    loadOrders();
    loadInventory();
    loadProducts();
    loadPayouts();
  }, []);

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
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const handleProductFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePayoutChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setPayoutForm((prev) => ({ ...prev, [name]: value }));
  };

  const requestPayout = async () => {
    setPayoutMessage(null);
    const amount = Number(payoutForm.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      setPayoutMessage("Enter a valid amount.");
      return;
    }
    try {
      const response = await fetch("/api/seller/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          method: payoutForm.method,
          account: payoutForm.account,
        }),
      });
      if (!response.ok) {
        throw new Error("Unable to submit payout request.");
      }
      setPayoutMessage("Payout request submitted.");
      setPayoutForm((prev) => ({ ...prev, amount: "" }));
      const refresh = await fetch("/api/seller/payouts");
      if (refresh.ok) {
        const data = (await refresh.json()) as {
          items: Array<{
            id: number;
            amount: number;
            method: string;
            account: string | null;
            status: string;
            createdAt: string;
          }>;
        };
        setPayouts(
          data.items.map((item) => ({
            id: item.id,
            date: new Date(item.createdAt).toLocaleDateString(),
            amount: `${item.amount.toLocaleString()} ETB`,
            status: item.status === "PENDING" ? "Pending" : "Paid",
          }))
        );
      }
    } catch (error) {
      setPayoutMessage(
        error instanceof Error ? error.message : "Failed to request payout."
      );
    }
  };

  const createProduct = async () => {
    setProductMessage(null);
    const trimmedName = productForm.name.trim();
    const price = Number(productForm.price);
    const stock = productForm.stock ? Number(productForm.stock) : 1;
    const category = productForm.category.trim() || "General";
    if (!trimmedName) {
      setProductMessage("Product name is required.");
      return;
    }
    if (Number.isNaN(price) || price <= 0) {
      setProductMessage("Enter a valid price.");
      return;
    }
    if (Number.isNaN(stock) || stock < 0) {
      setProductMessage("Enter a valid stock amount.");
      return;
    }
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          nameAm: productForm.nameAm,
          description: productForm.description,
          descriptionAm: productForm.descriptionAm,
          price,
          category,
          stock,
          image: productForm.image || "/file.svg",
          status: "PENDING",
        }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error ?? "Failed to create product.");
      }
      setProductForm({
        name: "",
        nameAm: "",
        description: "",
        descriptionAm: "",
        price: "",
        category: "",
        stock: "",
        image: "",
      });
      setProductMessage("Product submitted for approval.");
      await loadProducts();
    } catch (error) {
      setProductMessage(
        error instanceof Error ? error.message : "Failed to create product."
      );
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setProductMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json().catch(() => null)) as
        | { url?: string; error?: string }
        | null;
      if (!response.ok || !data?.url) {
        throw new Error(data?.error ?? "Image upload failed.");
      }
      setProductForm((prev) => ({ ...prev, image: data.url ?? "" }));
      setProductMessage("Image uploaded successfully.");
    } catch (error) {
      setProductMessage(
        error instanceof Error ? error.message : "Image upload failed."
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const updateProduct = async (productId: number, payload: Partial<{
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    image: string;
  }>) => {
    try {
      await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await loadProducts();
    } catch {
      // Ignore UI errors for now.
    }
  };

  const deleteProduct = async (productId: number) => {
    try {
      await fetch(`/api/products/${productId}`, { method: "DELETE" });
      await loadProducts();
    } catch {
      // Ignore UI errors for now.
    }
  };

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setGrowthMessage(`${label} copied`);
      setTimeout(() => setGrowthMessage(null), 1500);
    } catch {
      setGrowthMessage("Copy failed. Please select and copy manually.");
      setTimeout(() => setGrowthMessage(null), 2000);
    }
  };

  const togglePush = async () => {
    if (!("Notification" in window)) {
      setGrowthMessage("Push not supported in this browser.");
      return;
    }
    if (Notification.permission === "granted") {
      setPushOptIn(true);
      setGrowthMessage("Push notifications enabled.");
      return;
    }
    if (Notification.permission === "denied") {
      setGrowthMessage("Push permission denied in browser settings.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setPushOptIn(true);
      setGrowthMessage("Push notifications enabled.");
    } else {
      setGrowthMessage("Push not enabled.");
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
              href="/seller"
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-emerald-200"
            >
              Seller signup
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
            You need to sign in as a seller to access this page.{" "}
            <Link href="/login" className="font-semibold">
              Go to login
            </Link>
          </div>
        )}
        {!authLoading && auth?.role === "BUYER" && auth && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600 shadow-sm">
            Access denied. Seller role required.
          </div>
        )}
        {!authLoading && auth?.role && auth?.role !== "BUYER" && (
          <>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-600">
              Seller dashboard
            </p>
            <h1 className="text-3xl font-semibold">Sheger Fashion</h1>
            <p className="text-sm text-slate-500">
              Inventory synced 12 minutes ago
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
          <div className="flex gap-3">
            <button className="rounded-full border border-slate-200 px-4 py-2 text-sm transition hover:border-emerald-200">
              Update stock
            </button>
            <button className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
              Add product
            </button>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Today’s orders", value: activeOrders.toString() },
            { label: "Active listings", value: "38" },
            { label: "Payout due", value: "2,160 ETB" },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="text-2xl font-semibold">{card.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Orders</h2>
              <Link href="/track" className="text-sm text-emerald-700">
                Track customer orders
              </Link>
            </div>
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold">{order.id}</p>
                    <p className="text-xs text-slate-500">{order.customer}</p>
                  </div>
                  <div className="text-xs text-slate-500">
                    Update status
                  </div>
                  <select
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    value={order.status}
                    onChange={(event) =>
                      updateOrderStatus(order.id, event.target.value)
                    }
                  >
                    {["New", "Packed", "Dispatched", "Delivered", "Cancelled"].map(
                      (status) => (
                        <option key={status} value={status}>
                          {translateOrderStatus(status, language)}
                        </option>
                      )
                    )}
                  </select>
                  <Link
                    href={`/track?orderId=${order.id}`}
                  className="text-xs font-semibold text-emerald-700"
                  >
                    View tracking
                  </Link>
                  <div className="text-right">
                    <p className="font-semibold">{order.total}</p>
                    <p className="text-xs text-emerald-600">
                      {translateOrderStatus(order.status, language)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Payouts</h2>
            <div className="space-y-3">
              {payouts.map((payout) => (
                <div
                  key={payout.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm"
                >
                  <span>{payout.date}</span>
                  <span className="font-semibold">{payout.amount}</span>
                  <span className="text-xs text-slate-500">
                    {payout.status}
                  </span>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
              <p className="text-xs font-semibold text-slate-600">
                Request payout
              </p>
              <div className="mt-3 grid gap-3">
                <input
                  name="amount"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Amount (ETB)"
                  value={payoutForm.amount}
                  onChange={handlePayoutChange}
                />
                <select
                  name="method"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={payoutForm.method}
                  onChange={handlePayoutChange}
                >
                  <option>Telebirr</option>
                  <option>CBE Birr</option>
                  <option>Bank transfer</option>
                </select>
                <input
                  name="account"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Account / wallet number"
                  value={payoutForm.account}
                  onChange={handlePayoutChange}
                />
                <button
                  className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  onClick={requestPayout}
                >
                  Submit payout request
                </button>
                {payoutMessage && (
                  <p className="text-xs text-emerald-600">{payoutMessage}</p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Inventory</h2>
            <span className="text-xs text-slate-500">
              Update stock to sync availability
            </span>
          </div>
          {lowStockItems.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
              {lowStockItems.length} item
              {lowStockItems.length > 1 ? "s" : ""} low on stock. Restock soon.
            </div>
          )}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-3 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
              <span>Product</span>
              <span>Stock</span>
              <span>Price</span>
            </div>
            {inventory.map((item) => (
              <div
                key={item.name}
                className="grid grid-cols-3 gap-4 border-b border-slate-100 px-4 py-3 text-sm"
              >
                <span className="font-semibold">{item.name}</span>
                <div className="flex flex-wrap items-center gap-2">
                  <span>{item.stock} units</span>
                  {item.stock <= lowStockThreshold && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      Low stock
                    </span>
                  )}
                  <input
                    className="w-24 rounded-full border border-slate-200 px-3 py-1 text-xs focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    placeholder="Update"
                    value={stockUpdate[item.name] ?? ""}
                    onChange={(event) =>
                      setStockUpdate((prev) => ({
                        ...prev,
                        [item.name]: event.target.value,
                      }))
                    }
                  />
                  <button
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-emerald-200"
                    onClick={() => updateStock(item.name)}
                  >
                    Save
                  </button>
                </div>
                <span>{item.price}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Growth tools</h2>
            <span className="text-xs text-slate-500">
              Affiliates, referrals, regions, and AI
            </span>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold">Affiliate program</h3>
              <p className="text-xs text-slate-500">
                Share your affiliate link to earn commissions.
              </p>
              <div className="flex items-center gap-2">
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  value={`https://dealarada.com/?aff=${affiliateCode}`}
                  readOnly
                />
                <button
                  className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                  onClick={() =>
                    handleCopy(
                      `https://dealarada.com/?aff=${affiliateCode}`,
                      "Affiliate link"
                    )
                  }
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold">Referral system</h3>
              <p className="text-xs text-slate-500">
                Invite sellers and buyers with a referral code.
              </p>
              <div className="flex items-center gap-2">
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  value={referralCode}
                  readOnly
                />
                <button
                  className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                  onClick={() => handleCopy(referralCode, "Referral code")}
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold">Regional targeting</h3>
              <p className="text-xs text-slate-500">
                Prioritize promotions by delivery region.
              </p>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                value={regionTarget}
                onChange={(event) => setRegionTarget(event.target.value)}
              >
                <option>Woliso</option>
                <option>Addis Ababa</option>
                <option>Adama</option>
                <option>Bishoftu</option>
              </select>
              <p className="text-xs text-slate-500">
                Targeting: {regionTarget}
              </p>
            </div>
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold">Push notifications</h3>
              <p className="text-xs text-slate-500">
                Send updates to followers when you add new deals.
              </p>
              <button
                className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                onClick={togglePush}
              >
                {pushOptIn ? "Push enabled" : "Enable push"}
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">
                  AI product recommendations
                </h3>
                <p className="text-xs text-slate-500">
                  Auto-suggest related products to boost basket size.
                </p>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={aiRecsEnabled}
                  onChange={(event) => setAiRecsEnabled(event.target.checked)}
                />
                Enabled
              </label>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {[
                "Bundle accessories",
                "Offer delivery add-ons",
                "Promote top-rated items",
              ].map((tip) => (
                <div
                  key={tip}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600"
                >
                  {tip}
                </div>
              ))}
            </div>
          </div>
          {growthMessage && (
            <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {growthMessage}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Products</h2>
            <span className="text-xs text-slate-500">
              Add or edit your product listings
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold">Add new product</h3>
            <p className="mt-2 text-xs text-slate-500">
              Only product name and price are required. Stock defaults to 1 and
              category to General if left blank.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                placeholder="Product name (required)"
                name="name"
                value={productForm.name}
                onChange={handleProductFormChange}
              />
              <input
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                placeholder="Price (ETB) (required)"
                name="price"
                value={productForm.price}
                onChange={handleProductFormChange}
              />
              <input
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                placeholder="Stock (default 1)"
                name="stock"
                value={productForm.stock}
                onChange={handleProductFormChange}
              />
              <div className="md:col-span-2">
                <input
                  list="product-categories"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  placeholder="Category (e.g. Fashion)"
                  name="category"
                  value={productForm.category}
                  onChange={handleProductFormChange}
                />
                <datalist id="product-categories">
                  {productCategoryOptions.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </div>
              <input
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100 md:col-span-2"
                placeholder="Image URL (optional)"
                name="image"
                value={productForm.image}
                onChange={handleProductFormChange}
              />
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-500">
                  Upload image
                </label>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="text-xs"
                  />
                  {uploadingImage && (
                    <span className="text-xs text-slate-500">Uploading...</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="text-xs font-semibold text-emerald-700"
                onClick={() => setShowAdvanced((prev) => !prev)}
              >
                {showAdvanced ? "Hide optional fields" : "Show optional fields"}
              </button>
              {showAdvanced && (
                <>
                  <input
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100 md:col-span-2"
                    placeholder="Amharic product name"
                    name="nameAm"
                    value={productForm.nameAm}
                    onChange={handleProductFormChange}
                  />
                  <textarea
                    className="min-h-[90px] rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100 md:col-span-2"
                    placeholder="Description"
                    name="description"
                    value={productForm.description}
                    onChange={handleProductFormChange}
                  />
                  <textarea
                    className="min-h-[90px] rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100 md:col-span-2"
                    placeholder="Amharic description"
                    name="descriptionAm"
                    value={productForm.descriptionAm}
                    onChange={handleProductFormChange}
                  />
                </>
              )}
            </div>
            {productMessage && (
              <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {productMessage}
              </div>
            )}
            <button
              className="mt-4 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              onClick={createProduct}
            >
              Submit product
            </button>
          </div>

          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{product.name}</p>
                    <p className="text-xs text-slate-500">
                      {product.category} • {product.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs transition hover:border-emerald-200"
                      onClick={() =>
                        updateProduct(product.id, {
                          price: product.price,
                          stock: product.stock,
                        })
                      }
                    >
                      Save
                    </button>
                    <button
                      className="rounded-full border border-rose-200 px-3 py-1 text-xs text-rose-600 transition hover:border-rose-300"
                      onClick={() => deleteProduct(product.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <input
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    value={product.price}
                    onChange={(event) =>
                      setProducts((prev) =>
                        prev.map((item) =>
                          item.id === product.id
                            ? { ...item, price: Number(event.target.value) }
                            : item
                        )
                      )
                    }
                    placeholder="Price"
                  />
                  <input
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    value={product.stock}
                    onChange={(event) =>
                      setProducts((prev) =>
                        prev.map((item) =>
                          item.id === product.id
                            ? { ...item, stock: Number(event.target.value) }
                            : item
                        )
                      )
                    }
                    placeholder="Stock"
                  />
                  <input
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    value={product.image}
                    onChange={(event) =>
                      setProducts((prev) =>
                        prev.map((item) =>
                          item.id === product.id
                            ? { ...item, image: event.target.value }
                            : item
                        )
                      )
                    }
                    placeholder="Image URL"
                  />
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
