/**
 * HTTP smoke checks against a running Next app (default http://127.0.0.1:3010).
 * Run: npm run dev  (in another terminal)  then  npm run smoke
 */
const BASE = process.env.SMOKE_BASE ?? "http://127.0.0.1:3010";

async function get(path) {
  const r = await fetch(`${BASE}${path}`);
  return { path, status: r.status, ok: r.ok };
}

async function getJson(path) {
  const r = await fetch(`${BASE}${path}`);
  const json = await r.json().catch(() => null);
  return { status: r.status, ok: r.ok, json };
}

async function postJson(path, body) {
  const r = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await r.json().catch(() => null);
  return { status: r.status, ok: r.ok, json };
}

async function main() {
  const failures = [];

  const pageChecks = [
    ["/", 200],
    ["/login", 200],
    ["/register", 200],
    ["/categories", 200],
    ["/cart", 200],
    ["/wishlist", 200],
  ];

  for (const [path, expect] of pageChecks) {
    const r = await get(path);
    if (r.status !== expect) {
      const msg = `GET ${path} expected ${expect} got ${r.status}`;
      console.error("FAIL", msg);
      failures.push(msg);
    } else {
      console.log("OK  GET", path);
    }
  }

  const me = await getJson("/api/auth/me");
  if (!me.ok || me.json?.ok !== true || typeof me.json?.authenticated !== "boolean") {
    const msg = `GET /api/auth/me bad response: ${me.status}`;
    console.error("FAIL", msg, me.json);
    failures.push(msg);
  } else {
    console.log("OK  GET /api/auth/me guest=", !me.json.authenticated);
  }

  const products = await getJson("/api/products");
  if (!products.ok || !Array.isArray(products.json?.items)) {
    const msg = `GET /api/products expected items[]: ${products.status}`;
    console.error("FAIL", msg);
    failures.push(msg);
  } else {
    console.log("OK  GET /api/products count=", products.json.items.length);
  }

  const stamp = Date.now();
  const email = `smoke.${stamp}@dealarada.test`;
  const reg = await postJson("/api/auth/register", {
    name: "Smoke Test",
    email,
    password: "SmokeTest!8",
  });
  if (reg.status !== 200 || !reg.json?.user?.email) {
    const msg = `POST register failed: ${reg.status} ${JSON.stringify(reg.json)}`;
    console.error("FAIL", msg);
    failures.push(msg);
  } else {
    console.log("OK  POST /api/auth/register", reg.json.user.email);
  }

  const login = await postJson("/api/auth/login", {
    email,
    password: "SmokeTest!8",
  });
  if (login.status !== 200 || login.json?.user?.role !== "BUYER") {
    const msg = `POST login failed: ${login.status} ${JSON.stringify(login.json)}`;
    console.error("FAIL", msg);
    failures.push(msg);
  } else {
    console.log("OK  POST /api/auth/login");
  }

  if (failures.length) {
    console.error("\nSmoke finished with", failures.length, "failure(s).");
    process.exit(1);
  }
  console.log("\nAll smoke checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
