import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireRoles } from "@/lib/access";
import { getSellerProfileForUser } from "@/lib/marketplace";

export async function GET() {
  const guard = await requireRoles(["SELLER"]);
  if ("response" in guard) return guard.response;
  const { user } = guard;

  if (user.role === "ADMIN") {
    const rows = await db
      .prepare(
        `SELECT id, name, name_am as nameAm, description, description_am as descriptionAm,
                price, currency, category, rating, stock, image, status
         FROM products
         ORDER BY id DESC`
      )
      .all();
    return NextResponse.json({ items: rows, total: rows.length });
  }

  const seller = await getSellerProfileForUser(user);
  if (!seller) {
    return NextResponse.json(
      { error: "Seller profile not found." },
      { status: 404 }
    );
  }

  const rows = await db
    .prepare(
      `SELECT id, name, name_am as nameAm, description, description_am as descriptionAm,
              price, currency, category, rating, stock, image, status
       FROM products
       WHERE seller_id = ?
       ORDER BY id DESC`
    )
    .all(seller.id);

  return NextResponse.json({ items: rows, total: rows.length });
}
