"use client";

import { useEffect, useState } from "react";
import {
  isWishlisted,
  toggleWishlist,
  WISHLIST_UPDATED_EVENT,
} from "@/lib/wishlist";

type Props = {
  slug: string;
  name: string;
  priceLabel: string;
  image: string;
  className?: string;
  labelAdd?: string;
  labelRemove?: string;
};

export default function WishlistHeart({
  slug,
  name,
  priceLabel,
  image,
  className = "",
  labelAdd = "Save to wishlist",
  labelRemove = "Remove from wishlist",
}: Props) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isWishlisted(slug)); // eslint-disable-line react-hooks/set-state-in-effect -- hydrate from localStorage + slug
    const sync = () => setSaved(isWishlisted(slug));
    window.addEventListener(WISHLIST_UPDATED_EVENT, sync);
    return () => window.removeEventListener(WISHLIST_UPDATED_EVENT, sync);
  }, [slug]);

  return (
    <button
      type="button"
      aria-label={saved ? labelRemove : labelAdd}
      title={saved ? labelRemove : labelAdd}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-lg shadow-sm transition hover:border-rose-200 hover:bg-rose-50 ${className}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const on = toggleWishlist({ slug, name, priceLabel, image });
        setSaved(on);
      }}
    >
      <span className={saved ? "text-rose-600" : "text-slate-400"}>
        {saved ? "♥" : "♡"}
      </span>
    </button>
  );
}
