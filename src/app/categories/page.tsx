"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import useLanguage from "@/components/useLanguage";

const categories = [
  "Groceries",
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Beauty",
  "Stationery",
  "Farm Supplies",
  "Local Brands",
];

const featured = [
  {
    name: "Sports sneakers",
    price: "1,180 ETB",
    store: "Sheger Fashion",
    slug: "sports-sneakers",
    image: "/products/photo_5_2026-02-12_05-59-42.jpg",
    category: "Fashion",
    rating: 4.6,
    stock: 12,
  },
  {
    name: "Bluetooth speaker",
    price: "1,350 ETB",
    store: "Tech House",
    slug: "bluetooth-speaker",
    image: "/products/photo_6_2026-02-12_05-59-42.jpg",
    category: "Electronics",
    rating: 4.4,
    stock: 8,
  },
  {
    name: "Kids school kit",
    price: "430 ETB",
    store: "Bright Stationery",
    slug: "kids-school-kit",
    image: "/products/photo_7_2026-02-12_05-59-42.jpg",
    category: "Stationery",
    rating: 4.7,
    stock: 16,
  },
  {
    name: "Women’s handbag",
    price: "780 ETB",
    store: "Woliso Style",
    slug: "womens-handbag",
    image: "/products/photo_8_2026-02-12_05-59-42.jpg",
    category: "Fashion",
    rating: 4.3,
    stock: 6,
  },
];

const fallbackProducts = [
  {
    name: "Budget earphones",
    price: "320 ETB",
    store: "Tech House",
    slug: "budget-earphones",
    image: "/products/photo_2_2026-02-12_05-59-42.jpg",
    category: "Electronics",
    rating: 4.2,
    stock: 14,
    priceValue: 320,
  },
  {
    name: "Women’s casual dress",
    price: "890 ETB",
    store: "Woliso Style",
    slug: "womens-casual-dress",
    image: "/products/photo_3_2026-02-12_05-59-42.jpg",
    category: "Fashion",
    rating: 4.5,
    stock: 10,
    priceValue: 890,
  },
  {
    name: "Bluetooth speaker",
    price: "1,350 ETB",
    store: "Tech House",
    slug: "bluetooth-speaker",
    image: "/products/photo_6_2026-02-12_05-59-42.jpg",
    category: "Electronics",
    rating: 4.4,
    stock: 8,
    priceValue: 1350,
  },
  {
    name: "Premium running shoes",
    price: "2,180 ETB",
    store: "Sheger Fashion",
    slug: "premium-running-shoes",
    image: "/products/photo_14_2026-02-12_05-59-42.jpg",
    category: "Fashion",
    rating: 4.6,
    stock: 6,
    priceValue: 2180,
  },
];

export default function CategoriesPage() {
  const language = useLanguage();
  const t =
    language === "am"
      ? {
          cart: "ጋሪ",
          checkout: "ክፍያ",
          categories: "ምድቦች",
          shopByCategory: "በምድብ ግዛ",
          browseText: "ከታማኝ የወሊሶ ሻጮች ምርቶችን ይመልከቱ።",
          featuredProducts: "የተመረጡ ምርቶች",
          backHome: "ወደ መነሻ ተመለስ",
          allProducts: "ሁሉም ምርቶች",
          affordable: "በወሊሶ ተመጣጣኝ ምርጦች",
          searchProducts: "ምርቶችን ፈልግ",
          allCategories: "ሁሉም ምድቦች",
          allPrices: "ሁሉም ዋጋዎች",
          upTo1000: "እስከ 1,000 ብር",
          between1000_2000: "1,000 - 2,000 ብር",
          between2000_3000: "2,000 - 3,000 ብር",
          allRatings: "ሁሉም ደረጃዎች",
          rating4: "4.0+ ደረጃ",
          rating45: "4.5+ ደረጃ",
          rating47: "4.7+ ደረጃ",
          inStock: "በክምችት ውስጥ",
          outOfStock: "አልተገኘም",
          ratingLabel: "ደረጃ",
          view: "እይ",
          itemsCount: "150+ እቃዎች",
        }
      : {
          cart: "Cart",
          checkout: "Checkout",
          categories: "Categories",
          shopByCategory: "Shop by category",
          browseText: "Browse top products from verified Woliso sellers.",
          featuredProducts: "Featured products",
          backHome: "Back to home",
          allProducts: "All products",
          affordable: "Affordable picks for Woliso",
          searchProducts: "Search products",
          allCategories: "All categories",
          allPrices: "All prices",
          upTo1000: "Up to 1,000 ETB",
          between1000_2000: "1,000 - 2,000 ETB",
          between2000_3000: "2,000 - 3,000 ETB",
          allRatings: "All ratings",
          rating4: "4.0+ rating",
          rating45: "4.5+ rating",
          rating47: "4.7+ rating",
          inStock: "In stock",
          outOfStock: "Out of stock",
          ratingLabel: "Rating",
          view: "View",
          itemsCount: "150+ items",
        };
  const categoryLabel: Record<string, string> | null =
    language === "am"
      ? {
          Groceries: "ምግቦች",
          Electronics: "ኤሌክትሮኒክስ",
          Fashion: "ፋሽን",
          "Home & Kitchen": "ቤት እና ምግብ ቤት",
          Beauty: "ውበት",
          Stationery: "የጽሕፈት እቃዎች",
          "Farm Supplies": "የእርሻ እቃዎች",
          "Local Brands": "የአካባቢ ብራንዶች",
        }
      : null;
  const [apiProducts, setApiProducts] = useState<
    Array<{
      name: string;
      price: string;
      store: string;
      slug: string;
      image: string;
      category: string;
      rating: number;
      stock: number;
      priceValue: number;
    }>
  >(fallbackProducts);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState("all");
  const [minRating, setMinRating] = useState("all");
  const [stockOnly, setStockOnly] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) return;
        const data = (await response.json()) as {
          items: Array<{
            id: string;
            name: string;
            price: number;
            currency: string;
            category: string;
            rating: number;
            stock: number;
            image: string;
          }>;
        };
        const mapped = data.items.map((item) => ({
          name: item.name,
          price: `${item.price.toLocaleString()} ${item.currency}`,
          store: "DealArada",
          slug: item.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, ""),
          image: item.image,
          category: item.category,
          rating: item.rating,
          stock: item.stock,
          priceValue: item.price,
        }));
        if (mapped.length > 0) {
          setApiProducts(mapped);
        }
      } catch {
        // Keep fallback data if API fails.
      }
    };
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return apiProducts.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;

      const matchesPrice =
        priceRange === "all" ||
        (priceRange === "0-1000" && product.priceValue <= 1000) ||
        (priceRange === "1000-2000" &&
          product.priceValue > 1000 &&
          product.priceValue <= 2000) ||
        (priceRange === "2000-3000" &&
          product.priceValue > 2000 &&
          product.priceValue <= 3000);

      const matchesRating =
        minRating === "all" || product.rating >= Number(minRating);

      const matchesStock = !stockOnly || product.stock > 0;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPrice &&
        matchesRating &&
        matchesStock
      );
    });
  }, [apiProducts, search, selectedCategory, priceRange, minRating, stockOnly]);

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
              {t.cart}
            </Link>
            <Link
              href="/checkout"
              className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              {t.checkout}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-6 py-10">
        <div>
          <p className="text-sm font-semibold text-emerald-600">
            {t.categories}
          </p>
          <h1 className="text-3xl font-semibold">{t.shopByCategory}</h1>
          <p className="mt-2 text-slate-600">{t.browseText}</p>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <div
              key={category}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
            >
              <div className="mb-4 h-12 w-12 rounded-2xl bg-slate-100" />
              <p className="text-base font-semibold">
                {categoryLabel?.[category] ?? category}
              </p>
              <p className="text-sm text-slate-500">{t.itemsCount}</p>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t.featuredProducts}</h2>
            <Link href="/" className="text-sm font-semibold text-emerald-700">
              {t.backHome}
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((item) => (
              <div
                key={item.name}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-4 overflow-hidden rounded-xl bg-slate-100">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={400}
                    height={320}
                    className="h-32 w-full object-cover"
                  />
                </div>
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-slate-500">{item.store}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{categoryLabel?.[item.category] ?? item.category}</span>
                  <span>
                    {t.ratingLabel} {item.rating}
                  </span>
                </div>
                <div className="mt-1 text-xs text-emerald-600">
                  {item.stock > 0
                    ? `${item.stock} ${t.inStock}`
                    : t.outOfStock}
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="font-semibold">{item.price}</span>
                  <Link
                    href={`/products/${item.slug}`}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-emerald-200"
                  >
                    {t.view}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t.allProducts}</h2>
            <span className="text-sm text-slate-500">{t.affordable}</span>
          </div>
          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
            <input
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              placeholder={t.searchProducts}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              <option value="All">{t.allCategories}</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {categoryLabel?.[category] ?? category}
                </option>
              ))}
            </select>
            <select
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              value={priceRange}
              onChange={(event) => setPriceRange(event.target.value)}
            >
              <option value="all">{t.allPrices}</option>
              <option value="0-1000">{t.upTo1000}</option>
              <option value="1000-2000">{t.between1000_2000}</option>
              <option value="2000-3000">{t.between2000_3000}</option>
            </select>
            <select
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              value={minRating}
              onChange={(event) => setMinRating(event.target.value)}
            >
              <option value="all">{t.allRatings}</option>
              <option value="4">{t.rating4}</option>
              <option value="4.5">{t.rating45}</option>
              <option value="4.7">{t.rating47}</option>
            </select>
            <label className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <span>{t.inStock}</span>
              <input
                type="checkbox"
                checked={stockOnly}
                onChange={(event) => setStockOnly(event.target.checked)}
                className="h-4 w-4 accent-emerald-600"
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((item) => (
              <Link
                key={item.name}
                href={`/products/${item.slug}`}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
              >
                <div className="mb-4 overflow-hidden rounded-xl bg-slate-100">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={400}
                    height={320}
                    className="h-36 w-full object-cover"
                  />
                </div>
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-slate-500">{item.store}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{categoryLabel?.[item.category] ?? item.category}</span>
                  <span>
                    {t.ratingLabel} {item.rating}
                  </span>
                </div>
                <div className="mt-1 text-xs text-emerald-600">
                  {item.stock > 0
                    ? `${item.stock} ${t.inStock}`
                    : t.outOfStock}
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="font-semibold">{item.price}</span>
                  <span className="text-xs text-emerald-600">{t.view}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
