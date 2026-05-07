/**
 * End-to-end auth simulation (requires running app + POSTGRES_URL).
 * Usage: npm run dev  →  npm run verify:auth
 * Or: SMOKE_BASE=https://your.domain npm run verify:auth
 */
const BASE = process.env.SMOKE_BASE ?? "http://127.0.0.1:3010";

function extractSessionCookie(res) {
  const raw = res.headers.get("set-cookie") ?? "";
  const m = /da_session=([^;]+)/.exec(raw);
  return m ? `da_session=${m[1]}` : "";
}

function record(results, name, ok, detail = "") {
  results.push({ name, ok, detail });
  const mark = ok ? "PASS" : "FAIL";
  console.log(`[${mark}] ${name}${detail ? ` — ${detail}` : ""}`);
}

async function main() {
  const results = [];
  const email = `e2e.${Date.now()}@dealarada.test`;
  const password = "E2Everify9"; // 8+, letter + digit
  let cookie = "";

  // 1) Register
  const regRes = await fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "E2E User",
      email,
      password,
    }),
  });
  const regJson = await regRes.json().catch(() => ({}));
  cookie = extractSessionCookie(regRes);
  record(
    results,
    "Register new user",
    regRes.ok && regJson.user?.role === "BUYER" && !!cookie,
    `status=${regRes.status}`
  );

  // 2) /api/auth/me with session
  const me1 = await fetch(`${BASE}/api/auth/me`, {
    headers: cookie ? { Cookie: cookie } : {},
  });
  const me1j = await me1.json();
  record(
    results,
    "Session persists (GET /api/auth/me)",
    me1j.authenticated === true &&
      me1j.user?.email === email.toLowerCase(),
    JSON.stringify({ authenticated: me1j.authenticated })
  );

  // 3) Protected page: /account (manual redirect — authed = 200; guest = 307 to login)
  const acc = await fetch(`${BASE}/account`, {
    redirect: "manual",
    headers: cookie ? { Cookie: cookie } : {},
  });
  await acc.text();
  record(
    results,
    "Protected GET /account with session",
    acc.status === 200,
    `status=${acc.status} loc=${acc.headers.get("location") ?? ""}`
  );

  // 4) Buyer cannot hit admin API
  const admin = await fetch(`${BASE}/api/admin/users`, {
    headers: cookie ? { Cookie: cookie } : {},
  });
  record(
    results,
    "Buyer blocked from GET /api/admin/users",
    admin.status === 403 || admin.status === 401,
    `status=${admin.status}`
  );

  // 5) Logout
  const out = await fetch(`${BASE}/api/auth/logout`, {
    method: "POST",
    headers: cookie ? { Cookie: cookie } : {},
  });
  record(results, "POST /api/auth/logout", out.ok, `status=${out.status}`);

  // 6) Session cleared
  const me2 = await fetch(`${BASE}/api/auth/me`);
  const me2j = await me2.json();
  record(
    results,
    "After logout, guest on /api/auth/me",
    me2j.authenticated === false,
    String(me2j.authenticated)
  );

  // 7) Login again
  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const loginJson = await loginRes.json().catch(() => ({}));
  cookie = extractSessionCookie(loginRes);
  record(
    results,
    "Login existing user",
    loginRes.ok && loginJson.user?.email === email.toLowerCase() && !!cookie,
    `status=${loginRes.status}`
  );

  // 8) Wrong password
  const bad = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "WrongPass99" }),
  });
  const badj = await bad.json().catch(() => ({}));
  record(
    results,
    "Wrong password returns 401",
    bad.status === 401,
    `status=${bad.status} err=${badj.error ?? ""}`
  );

  // 9) Duplicate email
  const dup = await fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Dup",
      email,
      password: "Another99",
    }),
  });
  record(
    results,
    "Duplicate email returns 409",
    dup.status === 409,
    `status=${dup.status}`
  );

  // 10) Weak password (no digit)
  const weak = await fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "X",
      email: `weak.${Date.now()}@t.test`,
      password: "onlyletters",
    }),
  });
  const weakj = await weak.json().catch(() => ({}));
  record(
    results,
    "Weak password rejected (400)",
    weak.status === 400 && String(weakj.error ?? "").length > 0,
    `status=${weak.status}`
  );

  // 11) Empty login
  const empty = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "", password: "" }),
  });
  record(
    results,
    "Empty login rejected (400)",
    empty.status === 400,
    `status=${empty.status}`
  );

  // 12) Anonymous /account should redirect to login
  const anonAcc = await fetch(`${BASE}/account`, { redirect: "manual" });
  record(
    results,
    "Anonymous /account redirects",
    anonAcc.status === 307 ||
      anonAcc.status === 308 ||
      anonAcc.status === 302,
    `status=${anonAcc.status} loc=${anonAcc.headers.get("location") ?? ""}`
  );

  const failed = results.filter((r) => !r.ok);
  console.log("\n--- Summary ---");
  console.log(`Passed: ${results.length - failed.length}/${results.length}`);
  if (failed.length) {
    console.error("Failed:", failed.map((f) => f.name).join(", "));
    process.exit(1);
  }
  console.log("All auth flow checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
