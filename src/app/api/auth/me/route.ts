import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserBySession } from "@/lib/auth";

export async function GET() {
  const token = cookies().get("da_session")?.value ?? null;
  const user = getUserBySession(token);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}
