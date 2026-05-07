import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";

const BASE = process.env.SMOKE_BASE ?? "http://127.0.0.1:3010";

function readEnvValue(key) {
  const candidates = [".env.local", ".env.development.local", ".env"];
  for (const fileName of candidates) {
    const filePath = path.join(process.cwd(), fileName);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const lineKey = trimmed.slice(0, eq).trim();
      if (lineKey !== key) continue;
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      return value;
    }
  }
  return "";
}

const DATABASE_URL =
  process.env.POSTGRES_URL ??
  process.env.DATABASE_URL ??
  readEnvValue("POSTGRES_URL") ??
  readEnvValue("DATABASE_URL");

if (!DATABASE_URL) {
  throw new Error("Missing POSTGRES_URL or DATABASE_URL.");
}

const sql = neon(DATABASE_URL);

function record(results, name, ok, detail = "") {
  results.push({ name, ok, detail });
  const mark = ok ? "PASS" : "FAIL";
  console.log(`[${mark}] ${name}${detail ? ` — ${detail}` : ""}`);
}

function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

function extractSessionCookie(res) {
  const raw = res.headers.get("set-cookie") ?? "";
  const match = /da_session=([^;]+)/.exec(raw);
  return match ? `da_session=${match[1]}` : "";
}

async function requestJson(pathname, options = {}) {
  const headers = {};
  if (options.cookie) {
    headers.Cookie = options.cookie;
  }
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(`${BASE}${pathname}`, {
    method: options.method ?? "GET",
    headers,
    body:
      options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const json = await res.json().catch(() => null);
  return { res, json };
}

async function login(email, password) {
  const { res, json } = await requestJson("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
  return { res, json, cookie: extractSessionCookie(res) };
}

async function query(text, params = []) {
  return sql.query(text, params);
}

async function ensureDemoSellerProfile() {
  const email = normalizeEmail("yusuf@seller.com");
  const rows = await query(
    `SELECT id
     FROM sellers
     WHERE LOWER(TRIM(email)) = $1
     LIMIT 1`,
    [email]
  );
  if (rows.length > 0) {
    return;
  }

  await query(
    `INSERT INTO sellers (name, phone, location, status, email, category)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    ["Seller", "+251900000000", "Addis Ababa", "ACTIVE", email, "General"]
  );
}

async function cleanup(state) {
  try {
    if (state.orderCode) {
      const orderRows = await query(
        `SELECT id
         FROM orders
         WHERE order_code = $1
         LIMIT 1`,
        [state.orderCode]
      );
      const orderId = Number(orderRows[0]?.id);
      if (Number.isFinite(orderId)) {
        await query(`DELETE FROM delivery_status_history WHERE order_id = $1`, [
          orderId,
        ]);
        await query(`DELETE FROM inventory_adjustments WHERE order_id = $1`, [
          orderId,
        ]);
        await query(`DELETE FROM order_items WHERE order_id = $1`, [orderId]);
        await query(`DELETE FROM notifications WHERE message LIKE $1`, [
          `%${state.orderCode}%`,
        ]);
        await query(`DELETE FROM orders WHERE id = $1`, [orderId]);
      }
    }

    if (state.productAId) {
      await query(`DELETE FROM products WHERE id = $1`, [state.productAId]);
    }
    if (state.productBId) {
      await query(`DELETE FROM products WHERE id = $1`, [state.productBId]);
    }
    if (state.sellerBEmail) {
      await query(`DELETE FROM sellers WHERE LOWER(TRIM(email)) = $1`, [
        state.sellerBEmail,
      ]);
      await query(`DELETE FROM users WHERE LOWER(TRIM(email)) = $1`, [
        state.sellerBEmail,
      ]);
    }
    if (state.rider2Email) {
      await query(`DELETE FROM users WHERE LOWER(TRIM(email)) = $1`, [
        state.rider2Email,
      ]);
    }
  } catch (error) {
    console.warn(
      "Cleanup warning:",
      error instanceof Error ? error.message : String(error)
    );
  }
}

async function main() {
  const results = [];
  const state = {
    sellerBEmail: "",
    rider2Email: "",
    productAId: null,
    productBId: null,
    orderCode: "",
  };

  await requestJson("/api/auth/reset-demo", { method: "POST" });
  await ensureDemoSellerProfile();

  const stamp = Date.now();
  const productAName = `Ownership Product A ${stamp}`;
  const productBName = `Ownership Product B ${stamp}`;
  const sellerAEmail = "yusuf@seller.com";
  const sellerAPassword = "Seller@2026";
  state.sellerBEmail = normalizeEmail(`seller-${stamp}@dealarada.test`);
  const sellerBPassword = "SellerTest!9";
  state.rider2Email = normalizeEmail(`rider2-${stamp}@dealarada.test`);
  const rider2Password = "CourierTwo!9";

  const sellerA = await login(sellerAEmail, sellerAPassword);
  record(
    results,
    "Login demo seller",
    sellerA.res.ok && sellerA.json?.user?.role === "SELLER" && !!sellerA.cookie,
    `status=${sellerA.res.status}`
  );

  const sellerBSetup = await requestJson("/api/sellers", {
    method: "POST",
    body: {
      name: `Ownership Seller ${stamp}`,
      phone: "+251911000111",
      location: "Addis Ababa",
      category: "Fashion",
      email: state.sellerBEmail,
      password: sellerBPassword,
    },
  });
  record(
    results,
    "Create second seller",
    sellerBSetup.res.status === 201 &&
      sellerBSetup.json?.credentials?.email === state.sellerBEmail,
    `status=${sellerBSetup.res.status}`
  );

  const sellerB = await login(state.sellerBEmail, sellerBPassword);
  record(
    results,
    "Login second seller",
    sellerB.res.ok && sellerB.json?.user?.role === "SELLER" && !!sellerB.cookie,
    `status=${sellerB.res.status}`
  );

  const productA = await requestJson("/api/products", {
    method: "POST",
    cookie: sellerA.cookie,
    body: {
      name: productAName,
      price: 1250,
      stock: 4,
      category: "Electronics",
      currency: "ETB",
      description: "Owner A product",
    },
  });
  state.productAId = Number(productA.json?.item?.id);
  record(
    results,
    "Seller A creates product",
    productA.res.status === 201 && Number.isFinite(state.productAId),
    `status=${productA.res.status}`
  );

  const productB = await requestJson("/api/products", {
    method: "POST",
    cookie: sellerB.cookie,
    body: {
      name: productBName,
      price: 2300,
      stock: 2,
      category: "Fashion",
      currency: "ETB",
      description: "Owner B product",
    },
  });
  state.productBId = Number(productB.json?.item?.id);
  record(
    results,
    "Seller B creates product",
    productB.res.status === 201 && Number.isFinite(state.productBId),
    `status=${productB.res.status}`
  );

  const sellerAProducts = await requestJson("/api/seller/products", {
    cookie: sellerA.cookie,
  });
  const sellerAProductNames = Array.isArray(sellerAProducts.json?.items)
    ? sellerAProducts.json.items.map((item) => item?.name)
    : [];
  record(
    results,
    "Seller A sees own catalog only",
    sellerAProducts.res.ok &&
      sellerAProductNames.includes(productAName) &&
      !sellerAProductNames.includes(productBName),
    JSON.stringify({ count: sellerAProductNames.length })
  );

  const sellerBInventory = await requestJson("/api/inventory", {
    cookie: sellerB.cookie,
  });
  const sellerBInventoryNames = Array.isArray(sellerBInventory.json?.items)
    ? sellerBInventory.json.items.map((item) => item?.name)
    : [];
  record(
    results,
    "Seller B sees own inventory only",
    sellerBInventory.res.ok &&
      sellerBInventoryNames.includes(productBName) &&
      !sellerBInventoryNames.includes(productAName),
    JSON.stringify({ count: sellerBInventoryNames.length })
  );

  const sellerABadPatch = await requestJson(
    `/api/products/${state.productBId}`,
    {
      method: "PATCH",
      cookie: sellerA.cookie,
      body: { price: 9999 },
    }
  );
  record(
    results,
    "Seller A blocked from editing Seller B product",
    sellerABadPatch.res.status === 404,
    `status=${sellerABadPatch.res.status}`
  );

  const sellerABadDelete = await requestJson(
    `/api/products/${state.productBId}`,
    {
      method: "DELETE",
      cookie: sellerA.cookie,
    }
  );
  record(
    results,
    "Seller A blocked from deleting Seller B product",
    sellerABadDelete.res.status === 404,
    `status=${sellerABadDelete.res.status}`
  );

  const updatedPrice = 2400;
  const sellerBPatch = await requestJson(
    `/api/products/${state.productBId}`,
    {
      method: "PATCH",
      cookie: sellerB.cookie,
      body: { price: updatedPrice },
    }
  );
  record(
    results,
    "Seller B can edit own product",
    sellerBPatch.res.ok &&
      Number(sellerBPatch.json?.item?.price) === updatedPrice,
    `status=${sellerBPatch.res.status}`
  );

  const tamperedOrder = await requestJson("/api/orders", {
    method: "POST",
    body: {
      customerName: "Ownership Buyer",
      customerPhone: "+251900000222",
      address: "Addis Ababa",
      paymentMethod: "card",
      transactionId: "txn-ownership-1",
      items: [
        {
          productId: state.productAId,
          name: productAName,
          price: 1,
          quantity: 2,
        },
      ],
    },
  });
  state.orderCode = String(tamperedOrder.json?.item?.id ?? "");
  record(
    results,
    "Order total ignores client price",
    tamperedOrder.res.status === 201 &&
      Number(tamperedOrder.json?.item?.total) === 1250 * 2,
    JSON.stringify({ status: tamperedOrder.res.status, total: tamperedOrder.json?.item?.total })
  );

  const mixedOrder = await requestJson("/api/orders", {
    method: "POST",
    body: {
      customerName: "Mixed Seller Buyer",
      customerPhone: "+251900000333",
      address: "Addis Ababa",
      paymentMethod: "card",
      transactionId: "txn-ownership-2",
      items: [
        { productId: state.productAId, name: productAName, price: 999, quantity: 1 },
        { productId: state.productBId, name: productBName, price: 999, quantity: 1 },
      ],
    },
  });
  record(
    results,
    "Mixed-seller checkout is rejected",
    mixedOrder.res.status === 400,
    `status=${mixedOrder.res.status}`
  );

  const rider1 = await login("rider@dealarada.local", "Rider@2026");
  record(
    results,
    "Login demo rider",
    rider1.res.ok && rider1.json?.user?.role === "RIDER" && !!rider1.cookie,
    `status=${rider1.res.status}`
  );

  const rider2Setup = await query(
    `INSERT INTO users (name, email, role, password_hash)
     VALUES ($1, $2, 'RIDER', $3)
     ON CONFLICT (email) DO UPDATE
     SET name = EXCLUDED.name,
         role = EXCLUDED.role,
         password_hash = EXCLUDED.password_hash`,
    ["Courier Two", state.rider2Email, `demo:${rider2Password}`]
  );
  void rider2Setup;

  const rider2 = await login(state.rider2Email, rider2Password);
  record(
    results,
    "Login second rider",
    rider2.res.ok && rider2.json?.user?.role === "RIDER" && !!rider2.cookie,
    `status=${rider2.res.status}`
  );

  const rider1Assign = await requestJson(`/api/delivery/orders/${state.orderCode}`, {
    method: "PATCH",
    cookie: rider1.cookie,
    body: { deliveryStatus: "out for delivery" },
  });
  record(
    results,
    "Rider 1 can assign and update order",
    rider1Assign.res.ok,
    `status=${rider1Assign.res.status}`
  );

  const rider1List = await requestJson("/api/delivery/orders", {
    cookie: rider1.cookie,
  });
  const rider1ListCodes = Array.isArray(rider1List.json?.items)
    ? rider1List.json.items.map((item) => item?.id)
    : [];
  record(
    results,
    "Rider 1 sees assigned order",
    rider1List.res.ok && rider1ListCodes.includes(state.orderCode),
    JSON.stringify({ count: rider1ListCodes.length })
  );

  const rider1History = await requestJson(
    `/api/delivery/orders/${state.orderCode}/history`,
    {
      cookie: rider1.cookie,
    }
  );
  record(
    results,
    "Rider 1 can read delivery history",
    rider1History.res.ok && Number(rider1History.json?.total) >= 1,
    `status=${rider1History.res.status}`
  );

  const rider2List = await requestJson("/api/delivery/orders", {
    cookie: rider2.cookie,
  });
  const rider2ListCodes = Array.isArray(rider2List.json?.items)
    ? rider2List.json.items.map((item) => item?.id)
    : [];
  record(
    results,
    "Rider 2 does not see Rider 1 order",
    rider2List.res.ok && !rider2ListCodes.includes(state.orderCode),
    JSON.stringify({ count: rider2ListCodes.length })
  );

  const rider2History = await requestJson(
    `/api/delivery/orders/${state.orderCode}/history`,
    {
      cookie: rider2.cookie,
    }
  );
  record(
    results,
    "Rider 2 blocked from delivery history",
    rider2History.res.status === 404,
    `status=${rider2History.res.status}`
  );

  const rider2Patch = await requestJson(`/api/delivery/orders/${state.orderCode}`, {
    method: "PATCH",
    cookie: rider2.cookie,
    body: { deliveryStatus: "delivered" },
  });
  record(
    results,
    "Rider 2 blocked from Rider 1 order update",
    rider2Patch.res.status === 404,
    `status=${rider2Patch.res.status}`
  );

  const failed = results.filter((result) => !result.ok);
  console.log("\n--- Summary ---");
  console.log(`Passed: ${results.length - failed.length}/${results.length}`);
  if (failed.length) {
    console.error("Failed:", failed.map((result) => result.name).join(", "));
    process.exitCode = 1;
  } else {
    console.log("All access-control checks passed.");
  }

  await cleanup(state);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
