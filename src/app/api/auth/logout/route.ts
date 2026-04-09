import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteSession } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("da_session")?.value ?? null;
  deleteSession(token);
  cookieStore.set("da_session", "", { httpOnly: true, path: "/", maxAge: 0 });
  return NextResponse.json({ success: true });
}
