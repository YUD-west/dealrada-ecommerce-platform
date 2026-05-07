export const WISHLIST_STORAGE_KEY = "dealarada-wishlist";

export const WISHLIST_UPDATED_EVENT = "dealarada-wishlist-updated";

export type WishlistItem = {
  slug: string;
  name: string;
  priceLabel: string;
  image: string;
  addedAt: string;
};

function isItem(x: unknown): x is WishlistItem {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.slug === "string" &&
    typeof o.name === "string" &&
    typeof o.priceLabel === "string" &&
    typeof o.image === "string" &&
    typeof o.addedAt === "string"
  );
}

export function getWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isItem);
  } catch {
    return [];
  }
}

export function setWishlist(items: WishlistItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(WISHLIST_UPDATED_EVENT));
}

export function isWishlisted(slug: string): boolean {
  return getWishlist().some((i) => i.slug === slug);
}

/** Returns true if item is now saved, false if removed. */
export function toggleWishlist(
  item: Pick<WishlistItem, "slug" | "name" | "priceLabel" | "image">
): boolean {
  const items = getWishlist();
  const idx = items.findIndex((i) => i.slug === item.slug);
  if (idx >= 0) {
    items.splice(idx, 1);
    setWishlist(items);
    return false;
  }
  items.push({
    ...item,
    addedAt: new Date().toISOString(),
  });
  setWishlist(items);
  return true;
}

export function removeFromWishlist(slug: string): void {
  setWishlist(getWishlist().filter((i) => i.slug !== slug));
}

export function wishlistCount(): number {
  return getWishlist().length;
}
