import { NextResponse } from "next/server";
import db from "@/lib/db";
import { initDb } from "@/lib/seed";
import { requireRoles } from "@/lib/access";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  initDb();
  const product = db
    .prepare(
      `SELECT id, name, name_am as nameAm, description, description_am as descriptionAm,
              price, currency, category, rating, stock, image, status
       FROM products WHERE id = ?`
    )
    .get(id);

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ item: product });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireRoles(["SELLER"]);
  if ("response" in guard) return guard.response;

  const { id } = await params;
  initDb();
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

  const existing = db
    .prepare(`SELECT id, stock FROM products WHERE id = ?`)
    .get(id) as { id?: number; stock?: number } | undefined;
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const hasStockChange = typeof body.stock === "number";
  const stockChange =
    typeof body.stock === "number" && typeof existing.stock === "number"
      ? Math.trunc(body.stock) - existing.stock
      : 0;

  db.prepare(
    `UPDATE products
     SET name = COALESCE(@name, name),
         name_am = COALESCE(@nameAm, name_am),
         description = COALESCE(@description, description),
         description_am = COALESCE(@descriptionAm, description_am),
         price = COALESCE(@price, price),
         currency = COALESCE(@currency, currency),
         category = COALESCE(@category, category),
         rating = COALESCE(@rating, rating),
         stock = COALESCE(@stock, stock),
         image = COALESCE(@image, image),
         status = COALESCE(@status, status)
     WHERE id = @id`
  ).run({ ...body, id });

  if (hasStockChange && stockChange !== 0) {
    db.prepare(
      `INSERT INTO inventory_adjustments (product_id, change, reason, order_id, created_at)
       VALUES (?, ?, ?, ?, ?)`
    ).run(
      Number(existing.id),
      stockChange,
      "MANUAL",
      null,
      new Date().toISOString()
    );
  }

  const updated = db
    .prepare(
      `SELECT id, name, name_am as nameAm, description, description_am as descriptionAm,
              price, currency, category, rating, stock, image, status
       FROM products WHERE id = ?`
    )
    .get(id);

  return NextResponse.json({ item: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireRoles(["SELLER"]);
  if ("response" in guard) return guard.response;

  const { id } = await params;
  initDb();
  db.prepare(`DELETE FROM products WHERE id = ?`).run(id);
  return NextResponse.json({ success: true });
}
