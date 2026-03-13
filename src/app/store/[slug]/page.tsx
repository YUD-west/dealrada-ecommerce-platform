import Link from "next/link";

const storeMap: Record<string, { name: string; highlight: string }> = {
  "sheger-fashion": {
    name: "Sheger Fashion",
    highlight: "Trending styles, same-day delivery in Woliso.",
  },
  "woliso-style": {
    name: "Woliso Style",
    highlight: "Handpicked accessories with premium finishes.",
  },
  "tech-house": {
    name: "Tech House",
    highlight: "Electronics and gadgets with warranty support.",
  },
};

export default function StoreLandingPage({
  params,
}: {
  params: { slug: string };
}) {
  const store =
    storeMap[params.slug] ?? {
      name: "Featured seller",
      highlight: "Reliable products curated for Woliso customers.",
    };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold">
            DealArada
          </Link>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Link href="/categories">Categories</Link>
            <Link href="/cart">Cart</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">{store.name}</h1>
          <p className="text-sm text-slate-500">{store.highlight}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
            <span className="rounded-full border border-slate-200 px-3 py-1">
              4.7 ⭐ store rating
            </span>
            <span className="rounded-full border border-slate-200 px-3 py-1">
              Verified seller
            </span>
            <span className="rounded-full border border-slate-200 px-3 py-1">
              Fast fulfillment
            </span>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          {["Best sellers", "Latest drops", "Customer favorites"].map((label) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm"
            >
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-2 font-semibold">Products coming soon</p>
              <p className="text-xs text-slate-500">
                This storefront is being refreshed with new inventory.
              </p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 text-sm shadow-sm">
          <h2 className="text-lg font-semibold">Why customers love this store</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>• Consistent quality checks from DealArada.</li>
            <li>• Responsive seller support within business hours.</li>
            <li>• COD available for most items.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
