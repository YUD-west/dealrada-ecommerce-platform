import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserBySession, SESSION_COOKIE_NAME } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
  const user = await getUserBySession(token);
  // Always 200 + JSON so /api/auth/me is easy to sanity-check in the browser
  // (401 made fetch fail and some UIs showed only "null").
  return NextResponse.json({
    ok: true,
    authenticated: user != null,
    user: user ?? null,
  });
}
