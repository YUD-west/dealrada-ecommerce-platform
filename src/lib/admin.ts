import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserBySession, SESSION_COOKIE_NAME, type AuthUser } from "@/lib/auth";

type AdminGuard = { user: AuthUser } | { response: NextResponse };

export async function requireAdmin(): Promise<AdminGuard> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
  const user = await getUserBySession(token);
  if (!user) {
    return { response: NextResponse.json({ error: "Not authenticated." }, { status: 401 }) };
  }
  if (user.role !== "ADMIN") {
    return {
      response: NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      ),
    };
  }
  return { user };
}
