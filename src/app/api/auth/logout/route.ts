import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  deleteSession,
  SESSION_COOKIE_NAME,
  sessionClearCookieOptions,
} from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
  await deleteSession(token);
  cookieStore.set(SESSION_COOKIE_NAME, "", sessionClearCookieOptions());
  return NextResponse.json({ success: true });
}
