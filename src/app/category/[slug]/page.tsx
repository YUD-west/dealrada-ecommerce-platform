import Link from "next/link";

const categoryMap: Record<string, { title: string; description: string }> = {
  electronics: {
    title: "Electronics in Woliso",
    description:
      "Shop phones, speakers, and accessories from trusted local sellers.",
  },
  fashion: {
    title: "Fashion in Woliso",
    description:
      "Discover trending outfits, shoes, and accessories from verified stores.",
  },
  "home-kitchen": {
    title: "Home & Kitchen in Woliso",
    description:
      "Upgrade your home with kitchen essentials and daily needs.",
  },
  beauty: {
    title: "Beauty in Woliso",
    description: "Skincare, cosmetics, and wellness picks curated weekly.",
  },
  kids: {
    title: "Kids essentials in Woliso",
    description: "School kits, toys, and family-friendly bundles.",
  },
};

export default function CategoryLandingPage({
  params,
}: {
  params: { slug: string };
}) {
  const data =
    categoryMap[params.slug] ?? {
      title: "Shop in Woliso",
      description:
        "Browse trusted sellers and discover daily deals across categories.",
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
          <h1 className="text-2xl font-semibold">{data.title}</h1>
          <p className="text-sm text-slate-500">{data.description}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
            <span className="rounded-full border border-slate-200 px-3 py-1">
              Verified sellers
            </span>
            <span className="rounded-full border border-slate-200 px-3 py-1">
              Cash on delivery
            </span>
            <span className="rounded-full border border-slate-200 px-3 py-1">
              Fast delivery
            </span>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          {["Top picks", "Best sellers", "New arrivals"].map((label) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm"
            >
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-2 font-semibold">
                Curated deals coming soon
              </p>
              <p className="text-xs text-slate-500">
                We are preparing this collection for Woliso shoppers.
              </p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 text-sm shadow-sm">
          <h2 className="text-lg font-semibold">Why shop this category?</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>• Transparent pricing from local sellers.</li>
            <li>• Inventory verified daily by DealArada.</li>
            <li>• Secure payment with delivery support.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
