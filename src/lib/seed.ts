import db from "@/lib/db";

export function initDb() {
  const ensureColumn = (table: string, column: string, definition: string) => {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{
      name: string;
    }>;
    if (!columns.find((col) => col.name === column)) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    }
  };

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      role TEXT NOT NULL,
      password_hash TEXT
    );

    CREATE TABLE IF NOT EXISTS sellers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      location TEXT NOT NULL,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_am TEXT,
      description TEXT NOT NULL,
      description_am TEXT,
      price INTEGER NOT NULL,
      currency TEXT NOT NULL,
      category TEXT NOT NULL,
      rating REAL NOT NULL,
      stock INTEGER NOT NULL,
      image TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'APPROVED',
      seller_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_code TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      total INTEGER NOT NULL,
      currency TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      customer_phone TEXT,
      address TEXT,
      payment_method TEXT,
      payment_status TEXT,
      transaction_id TEXT,
      seller_id INTEGER,
      rider_name TEXT,
      delivery_status TEXT
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      rating INTEGER NOT NULL,
      note TEXT,
      photo_url TEXT,
      status TEXT NOT NULL DEFAULT 'APPROVED',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      role TEXT,
      channel TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notification_subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_code TEXT NOT NULL,
      channel TEXT NOT NULL,
      contact TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payment_methods (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS disputes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference TEXT NOT NULL,
      issue TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS delivery_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS inventory_adjustments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      change INTEGER NOT NULL,
      reason TEXT NOT NULL,
      order_id INTEGER,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS seller_payouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      seller_id INTEGER,
      amount INTEGER NOT NULL,
      method TEXT NOT NULL,
      account TEXT,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS promotions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL,
      type TEXT NOT NULL,
      value INTEGER NOT NULL,
      starts_at TEXT,
      ends_at TEXT,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  ensureColumn("users", "password_hash", "TEXT");
  ensureColumn("products", "status", "TEXT NOT NULL DEFAULT 'APPROVED'");
  ensureColumn("products", "seller_id", "INTEGER");
  ensureColumn("products", "created_at", "TEXT NOT NULL DEFAULT (datetime('now'))");
  ensureColumn("products", "name_am", "TEXT");
  ensureColumn("products", "description_am", "TEXT");
  ensureColumn("orders", "customer_phone", "TEXT");
  ensureColumn("orders", "address", "TEXT");
  ensureColumn("orders", "payment_method", "TEXT");
  ensureColumn("orders", "payment_status", "TEXT");
  ensureColumn("orders", "transaction_id", "TEXT");
  ensureColumn("orders", "seller_id", "INTEGER");
  ensureColumn("orders", "rider_name", "TEXT");
  ensureColumn("orders", "delivery_status", "TEXT");
  ensureColumn("sellers", "email", "TEXT");
  ensureColumn("sellers", "category", "TEXT");
  ensureColumn("reviews", "photo_url", "TEXT");
  ensureColumn("reviews", "status", "TEXT NOT NULL DEFAULT 'APPROVED'");

  const getCount = (table: string) => {
    const row = db
      .prepare(`SELECT COUNT(*) as count FROM ${table}`)
      .get() as { count?: number } | undefined;
    return Number(row?.count ?? 0);
  };

  const paymentCount = getCount("payment_methods");
  const disputeCount = getCount("disputes");
  const deliveryHistoryCount = getCount("delivery_status_history");
  const productCount = getCount("products");
  const userCount = getCount("users");

  if (paymentCount === 0) {
    const insertPayment = db.prepare(
      `INSERT OR IGNORE INTO payment_methods (id, label, enabled, sort_order)
       VALUES (?, ?, ?, ?)`
    );
    const payments = [
      { id: "cod", label: "Cash on delivery", enabled: 1, sortOrder: 1 },
      { id: "telebirr", label: "Telebirr", enabled: 1, sortOrder: 2 },
      { id: "cbe-birr", label: "CBE Birr", enabled: 1, sortOrder: 3 },
      { id: "mpesa", label: "M-Pesa", enabled: 1, sortOrder: 4 },
    ];
    const insertPayments = db.transaction(() => {
      for (const method of payments) {
        insertPayment.run(
          method.id,
          method.label,
          method.enabled,
          method.sortOrder
        );
      }
    });
    insertPayments();
  }

  if (disputeCount === 0) {
    const insertDispute = db.prepare(
      `INSERT INTO disputes (reference, issue, status, created_at)
       VALUES (?, ?, ?, ?)`
    );
    const now = new Date().toISOString();
    insertDispute.run("DS-21", "Late delivery", "OPEN", now);
    insertDispute.run("DS-22", "Wrong item", "RESOLVED", now);
  }

  if (deliveryHistoryCount === 0) {
    const insertHistory = db.prepare(
      `INSERT INTO delivery_status_history (order_id, status, note, created_at)
       VALUES (?, ?, ?, ?)`
    );
    const order = db
      .prepare(`SELECT id, status FROM orders ORDER BY id ASC LIMIT 1`)
      .get() as { id?: number; status?: string } | undefined;
    if (order?.id) {
      insertHistory.run(
        order.id,
        order.status ?? "NEW",
        "Order placed.",
        new Date().toISOString()
      );
    }
  }

  const upsertUser = (user: {
    name: string;
    email: string;
    role: string;
    password_hash: string;
  }) => {
    const existing = db
      .prepare(`SELECT id FROM users WHERE role = ?`)
      .get(user.role) as { id?: number } | undefined;

    if (existing?.id) {
      db.prepare(
        `UPDATE users
         SET name = ?, email = ?, password_hash = ?
         WHERE id = ?`
      ).run(user.name, user.email, user.password_hash, existing.id);
      return;
    }

    db.prepare(
      `INSERT INTO users (name, email, role, password_hash)
       VALUES (?, ?, ?, ?)`
    ).run(user.name, user.email, user.role, user.password_hash);
  };

  if (userCount === 0) {
    upsertUser({
      name: "Admin",
      email: "admin@dealarada.local",
      role: "ADMIN",
      password_hash: "demo:Admin@2026",
    });
    upsertUser({
      name: "Buyer",
      email: "buyer@dealarada.local",
      role: "BUYER",
      password_hash: "demo:Buyer@2026",
    });
  }

  // Always keep seller credentials in sync.
  upsertUser({
    name: "Seller",
    email: "yusuf@seller.com",
    role: "SELLER",
    password_hash: "demo:Seller@2026",
  });

  // Ensure rider login is available for delivery dashboard.
  upsertUser({
    name: "Rider",
    email: "rider@dealarada.local",
    role: "RIDER",
    password_hash: "demo:Rider@2026",
  });

  if (productCount > 0) return;

  const insertSeller = db.prepare(`
    INSERT INTO sellers (name, phone, location, status)
    VALUES (@name, @phone, @location, @status)
  `);

  const sellerRow = db
    .prepare("SELECT id FROM sellers WHERE name = ?")
    .get("Sheger Fashion") as { id?: number } | undefined;

  let sellerId = sellerRow?.id;
  if (!sellerId) {
    const result = insertSeller.run({
      name: "Sheger Fashion",
      phone: "+251911000000",
      location: "Woliso",
      status: "ACTIVE",
    });
    sellerId = Number(result.lastInsertRowid);
  }

  const insertProduct = db.prepare(`
    INSERT INTO products (name, description, price, currency, category, rating, stock, image, status, seller_id)
    VALUES (@name, @description, @price, @currency, @category, @rating, @stock, @image, @status, @seller_id)
  `);

  const products = [
    {
      name: "Budget earphones",
      description: "Lightweight earphones with clear sound and strong bass.",
      price: 320,
      currency: "ETB",
      category: "Electronics",
      rating: 4.2,
      stock: 14,
      image: "/products/photo_2_2026-02-12_05-59-42.jpg",
      status: "APPROVED",
      seller_id: sellerId,
    },
    {
      name: "Women’s casual dress",
      description: "Comfortable everyday dress for work or weekend.",
      price: 890,
      currency: "ETB",
      category: "Fashion",
      rating: 4.5,
      stock: 10,
      image: "/products/photo_3_2026-02-12_05-59-42.jpg",
      status: "APPROVED",
      seller_id: sellerId,
    },
    {
      name: "Bluetooth speaker",
      description: "Portable speaker with deep bass and 6-hour battery.",
      price: 1350,
      currency: "ETB",
      category: "Electronics",
      rating: 4.4,
      stock: 8,
      image: "/products/photo_6_2026-02-12_05-59-42.jpg",
      status: "APPROVED",
      seller_id: sellerId,
    },
    {
      name: "Premium running shoes",
      description: "High-grip running shoes with breathable lining.",
      price: 2180,
      currency: "ETB",
      category: "Fashion",
      rating: 4.6,
      stock: 6,
      image: "/products/photo_14_2026-02-12_05-59-42.jpg",
      status: "APPROVED",
      seller_id: sellerId,
    },
  ];

  const insertMany = db.transaction(() => {
    for (const product of products) insertProduct.run(product);
  });
  insertMany();

  const insertOrder = db.prepare(`
    INSERT INTO orders (order_code, customer_name, total, currency, status, created_at, seller_id)
    VALUES (@order_code, @customer_name, @total, @currency, @status, @created_at, @seller_id)
  `);

  const orders = [
    {
      order_code: "DA-1023",
      customer_name: "Abel T.",
      total: 1450,
      currency: "ETB",
      status: "DISPATCHED",
      created_at: new Date().toISOString(),
      seller_id: sellerId,
    },
    {
      order_code: "DA-1024",
      customer_name: "Sofia K.",
      total: 890,
      currency: "ETB",
      status: "NEW",
      created_at: new Date().toISOString(),
      seller_id: sellerId,
    },
    {
      order_code: "DA-1025",
      customer_name: "Hana M.",
      total: 2180,
      currency: "ETB",
      status: "PACKED",
      created_at: new Date().toISOString(),
      seller_id: sellerId,
    },
  ];

  const insertOrders = db.transaction(() => {
    for (const order of orders) insertOrder.run(order);
  });
  insertOrders();
}
