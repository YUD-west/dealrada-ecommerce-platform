import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireRoles } from "@/lib/access";
import {
  coerceNumericId,
  getSellerProfileForUser,
  slugifyProductName,
} from "@/lib/marketplace";

const PRODUCT_SELECT = `
  SELECT id, name, name_am as nameAm, description, description_am as descriptionAm,
         price, currency, category, rating, stock, image, status
  FROM products
`;

/** Route param for PATCH/DELETE must be decimal digits only (trimmed) for BIGINT `products.id`. */
function productIdDecimalString(raw: string): string | null {
  const s = raw.trim();
  return /^\d+$/.test(s) ? s : null;
}

async function getProductByIdentifier(identifier: string) {
  const trimmed = identifier.trim();
  if (trimmed === "") return undefined;

  if (/^\d+$/.test(trimmed)) {
    return await db
      .prepare(`${PRODUCT_SELECT} WHERE id = CAST(? AS BIGINT)`)
      .get(trimmed);
  }

  const slug = slugifyProductName(trimmed);
  if (!slug) return undefined;

  return await db
    .prepare(
      `${PRODUCT_SELECT}
       WHERE LOWER(REGEXP_REPLACE(TRIM(name), '[^a-z0-9]+', '-', 'g')) = CAST(? AS TEXT)`
    )
    .get(slug);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await getProductByIdentifier(id);

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ item: product });
}

async function assertProductOwnership(
  userRole: string,
  userEmail: string | null,
  productId: string
) {
  if (userRole === "ADMIN") return null;
  if (!userEmail) {
    return NextResponse.json(
      { error: "Seller profile not found." },
      { status: 404 }
    );
  }

  const seller = await getSellerProfileForUser({ email: userEmail });
  if (!seller) {
    return NextResponse.json(
      { error: "Seller profile not found." },
      { status: 404 }
    );
  }

  const idKey = productIdDecimalString(productId);
  if (!idKey) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const owner = (await db
    .prepare(`SELECT seller_id FROM products WHERE id = CAST(? AS BIGINT)`)
    .get(idKey)) as { seller_id?: unknown } | undefined;
  if (!owner || coerceNumericId(owner.seller_id) !== seller.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireRoles(["SELLER"]);
  if ("response" in guard) return guard.response;
  const { user } = guard;

  const { id } = await params;
  const idKey = productIdDecimalString(id);
  if (!idKey) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const ownershipError = await assertProductOwnership(user.role, user.email, id);
  if (ownershipError) return ownershipError;

  const body = (await request.json()) as {
    name?: string;
    nameAm?: string;
    description?: string;
    descriptionAm?: string;
    price?: number;
    currency?: string;
    category?: string;
    rating?: number;
    stock?: number;
    image?: string;
    status?: string;
  };

  const existing = (await db
    .prepare(`SELECT id, stock FROM products WHERE id = CAST(? AS BIGINT)`)
    .get(idKey)) as { id?: number; stock?: number } | undefined;
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const hasStockChange = typeof body.stock === "number";
  const stockChange =
    typeof body.stock === "number" && typeof existing.stock === "number"
      ? Math.trunc(body.stock) - existing.stock
      : 0;

  await db
    .prepare(
      `UPDATE products
       SET name = COALESCE(?, name),
           name_am = COALESCE(?, name_am),
           description = COALESCE(?, description),
           description_am = COALESCE(?, description_am),
           price = COALESCE(?, price),
           currency = COALESCE(?, currency),
           category = COALESCE(?, category),
           rating = COALESCE(?, rating),
           stock = COALESCE(?, stock),
           image = COALESCE(?, image),
           status = COALESCE(?, status)
       WHERE id = CAST(? AS BIGINT)`
    )
    .run(
      body.name ?? null,
      body.nameAm ?? null,
      body.description ?? null,
      body.descriptionAm ?? null,
      body.price ?? null,
      body.currency ?? null,
      body.category ?? null,
      body.rating ?? null,
      body.stock ?? null,
      body.image ?? null,
      body.status ?? null,
      idKey
    );

  if (hasStockChange && stockChange !== 0) {
    await db
      .prepare(
        `INSERT INTO inventory_adjustments (product_id, change, reason, order_id, created_at)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(
        Number(existing.id),
        stockChange,
        "MANUAL",
        null,
        new Date().toISOString()
      );
  }

  const updated = await db
    .prepare(
      `SELECT id, name, name_am as nameAm, description, description_am as descriptionAm,
              price, currency, category, rating, stock, image, status
       FROM products WHERE id = CAST(? AS BIGINT)`
    )
    .get(idKey);

  return NextResponse.json({ item: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireRoles(["SELLER"]);
  if ("response" in guard) return guard.response;
  const { user } = guard;

  const { id } = await params;
  const idKey = productIdDecimalString(id);
  if (!idKey) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const ownershipError = await assertProductOwnership(user.role, user.email, id);
  if (ownershipError) return ownershipError;

  await db
    .prepare(`DELETE FROM products WHERE id = CAST(? AS BIGINT)`)
    .run(idKey);
  return NextResponse.json({ success: true });
}
