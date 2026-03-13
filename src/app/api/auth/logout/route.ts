import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteSession } from "@/lib/auth";

export async function POST() {
  const token = cookies().get("da_session")?.value ?? null;
  deleteSession(token);
  cookies().set("da_session", "", { httpOnly: true, path: "/", maxAge: 0 });
  return NextResponse.json({ success: true });
}
