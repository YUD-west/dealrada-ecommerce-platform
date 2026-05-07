import { getSql, toPostgresSql } from "@/lib/db-connection";

let initPromise: Promise<void> | null = null;
/** After first successful init, skip promise work on every query. */
let dbInitialized = false;

const DDL = [
  `CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      role TEXT NOT NULL,
      password_hash TEXT
    )`,
  `CREATE TABLE IF NOT EXISTS sellers (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      location TEXT NOT NULL,
      status TEXT NOT NULL,
      email TEXT,
      category TEXT
    )`,
  `CREATE TABLE IF NOT EXISTS products (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      name_am TEXT,
      description TEXT NOT NULL,
      description_am TEXT,
      price INTEGER NOT NULL,
      currency TEXT NOT NULL,
      category TEXT NOT NULL,
      rating DOUBLE PRECISION NOT NULL,
      stock INTEGER NOT NULL,
      image TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'APPROVED',
      seller_id BIGINT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
  `CREATE TABLE IF NOT EXISTS orders (
      id BIGSERIAL PRIMARY KEY,
      order_code TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      total INTEGER NOT NULL,
      currency TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      customer_phone TEXT,
      address TEXT,
      payment_method TEXT,
      payment_status TEXT,
      transaction_id TEXT,
      seller_id BIGINT,
      rider_name TEXT,
      delivery_status TEXT
    )`,
  `CREATE TABLE IF NOT EXISTS order_items (
      id BIGSERIAL PRIMARY KEY,
      order_id BIGINT NOT NULL,
      product_id BIGINT NOT NULL,
      quantity INTEGER NOT NULL,
      price INTEGER NOT NULL
    )`,
  `CREATE TABLE IF NOT EXISTS reviews (
      id BIGSERIAL PRIMARY KEY,
      product_id BIGINT NOT NULL,
      user_id BIGINT NOT NULL,
      rating INTEGER NOT NULL,
      note TEXT,
      photo_url TEXT,
      status TEXT NOT NULL DEFAULT 'APPROVED',
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
  `CREATE TABLE IF NOT EXISTS notifications (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT,
      role TEXT,
      channel TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
  `CREATE TABLE IF NOT EXISTS notification_subscriptions (
      id BIGSERIAL PRIMARY KEY,
      order_code TEXT NOT NULL,
      channel TEXT NOT NULL,
      contact TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
  `CREATE TABLE IF NOT EXISTS sessions (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL
    )`,
  `CREATE TABLE IF NOT EXISTS payment_methods (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0
    )`,
  `CREATE TABLE IF NOT EXISTS disputes (
      id BIGSERIAL PRIMARY KEY,
      reference TEXT NOT NULL,
      issue TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
  `CREATE TABLE IF NOT EXISTS delivery_status_history (
      id BIGSERIAL PRIMARY KEY,
      order_id BIGINT NOT NULL,
      status TEXT NOT NULL,
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
  `CREATE TABLE IF NOT EXISTS inventory_adjustments (
      id BIGSERIAL PRIMARY KEY,
      product_id BIGINT NOT NULL,
      change INTEGER NOT NULL,
      reason TEXT NOT NULL,
      order_id BIGINT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
  `CREATE TABLE IF NOT EXISTS seller_payouts (
      id BIGSERIAL PRIMARY KEY,
      seller_id BIGINT,
      amount INTEGER NOT NULL,
      method TEXT NOT NULL,
      account TEXT,
      status TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
  `CREATE TABLE IF NOT EXISTS promotions (
      id BIGSERIAL PRIMARY KEY,
      code TEXT NOT NULL,
      type TEXT NOT NULL,
      value INTEGER NOT NULL,
      starts_at TIMESTAMPTZ,
      ends_at TIMESTAMPTZ,
      status TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
];

async function countRows(table: string): Promise<number> {
  const sql = getSql();
  const rows = (await sql.query(
    toPostgresSql(`SELECT COUNT(*)::int AS count FROM ${table}`),
    []
  )) as Array<{ count: number }>;
  return Number(rows[0]?.count ?? 0);
}

export async function initDb() {
  if (dbInitialized) return;
  if (initPromise) {
    await initPromise;
    return;
  }

  initPromise = (async () => {
    const sql = getSql();
    for (const stmt of DDL) {
      await sql.query(toPostgresSql(stmt), []);
    }

    if ((await countRows("payment_methods")) === 0) {
      await sql.query(
        toPostgresSql(
          `INSERT INTO payment_methods (id, label, enabled, sort_order)
           VALUES ('cod','Cash on delivery',1,1),
                  ('telebirr','Telebirr',1,2),
                  ('cbe-birr','CBE Birr',1,3),
                  ('mpesa','M-Pesa',1,4)`
        ),
        []
      );
    }

    const upsertUser = async (user: {
      name: string;
      email: string;
      role: string;
      password_hash: string;
    }) => {
      await sql.query(
        toPostgresSql(
          `INSERT INTO users (name, email, role, password_hash)
           VALUES (?, ?, ?, ?)
           ON CONFLICT (email) DO UPDATE
           SET name = EXCLUDED.name, role = EXCLUDED.role, password_hash = EXCLUDED.password_hash`
        ),
        [user.name, user.email, user.role, user.password_hash]
      );
    };

    await Promise.all([
      upsertUser({
        name: "Admin",
        email: "admin@dealarada.local",
        role: "ADMIN",
        password_hash: "demo:Admin@2026",
      }),
      upsertUser({
        name: "Buyer",
        email: "buyer@dealarada.local",
        role: "BUYER",
        password_hash: "demo:Buyer@2026",
      }),
      upsertUser({
        name: "Seller",
        email: "yusuf@seller.com",
        role: "SELLER",
        password_hash: "demo:Seller@2026",
      }),
      upsertUser({
        name: "Rider",
        email: "rider@dealarada.local",
        role: "RIDER",
        password_hash: "demo:Rider@2026",
      }),
    ]);

    if ((await countRows("sellers")) === 0) {
      await sql.query(
        toPostgresSql(
          `INSERT INTO sellers (name, phone, location, status, email, category)
           VALUES (?, ?, ?, ?, ?, ?)`
        ),
        [
          "Sheger Fashion",
          "+251911000000",
          "Woliso",
          "ACTIVE",
          "yusuf@seller.com",
          "Fashion",
        ]
      );
    }

    const sellerRows = (await sql.query(
      toPostgresSql(`SELECT id FROM sellers ORDER BY id ASC LIMIT 1`),
      []
    )) as Array<{ id: number }>;
    const sellerId = sellerRows[0]?.id;

    if (sellerId && (await countRows("products")) === 0) {
      const products: Array<
        [string, string, number, string, string, number, number, string]
      > = [
        [
          "Budget earphones",
          "Lightweight earphones with clear sound and strong bass.",
          320,
          "ETB",
          "Electronics",
          4.2,
          14,
          "/products/photo_2_2026-02-12_05-59-42.jpg",
        ],
        [
          "Women’s casual dress",
          "Comfortable everyday dress for work or weekend.",
          890,
          "ETB",
          "Fashion",
          4.5,
          10,
          "/products/photo_3_2026-02-12_05-59-42.jpg",
        ],
        [
          "Bluetooth speaker",
          "Portable speaker with deep bass and 6-hour battery.",
          1350,
          "ETB",
          "Electronics",
          4.4,
          8,
          "/products/photo_6_2026-02-12_05-59-42.jpg",
        ],
        [
          "Premium running shoes",
          "High-grip running shoes with breathable lining.",
          2180,
          "ETB",
          "Fashion",
          4.6,
          6,
          "/products/photo_14_2026-02-12_05-59-42.jpg",
        ],
      ];
      const valueRows = products
        .map(() => "(?, ?, ?, ?, ?, ?, ?, ?, 'APPROVED', ?)")
        .join(", ");
      const productParams = products.flatMap((p) => [...p, sellerId]);
      await sql.query(
        toPostgresSql(
          `INSERT INTO products (name, description, price, currency, category, rating, stock, image, status, seller_id)
           VALUES ${valueRows}`
        ),
        productParams
      );
    }

    if (sellerId && (await countRows("orders")) === 0) {
      const now = new Date().toISOString();
      await sql.query(
        toPostgresSql(
          `INSERT INTO orders (order_code, customer_name, total, currency, status, created_at, seller_id)
           VALUES
           ('DA-1023', 'Abel T.', 1450, 'ETB', 'DISPATCHED', ?, ?),
           ('DA-1024', 'Sofia K.', 890, 'ETB', 'NEW', ?, ?),
           ('DA-1025', 'Hana M.', 2180, 'ETB', 'PACKED', ?, ?)`
        ),
        [now, sellerId, now, sellerId, now, sellerId]
      );
    }

    if ((await countRows("disputes")) === 0) {
      await sql.query(
        toPostgresSql(
          `INSERT INTO disputes (reference, issue, status)
           VALUES ('DS-21', 'Late delivery', 'OPEN'),
                  ('DS-22', 'Wrong item', 'RESOLVED')`
        ),
        []
      );
    }

    if ((await countRows("delivery_status_history")) === 0) {
      const orderRows = (await sql.query(
        toPostgresSql(`SELECT id, status FROM orders ORDER BY id ASC LIMIT 1`),
        []
      )) as Array<{ id: number; status: string }>;
      const order = orderRows[0];
      if (order?.id) {
        await sql.query(
          toPostgresSql(
            `INSERT INTO delivery_status_history (order_id, status, note)
             VALUES (?, ?, ?)`
          ),
          [order.id, order.status ?? "NEW", "Order placed."]
        );
      }
    }
    dbInitialized = true;
  })().catch((e) => {
    initPromise = null;
    dbInitialized = false;
    throw e;
  });

  await initPromise;
}
