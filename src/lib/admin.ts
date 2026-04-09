import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserBySession, type AuthUser } from "@/lib/auth";

type AdminGuard = { user: AuthUser } | { response: NextResponse };

export async function requireAdmin(): Promise<AdminGuard> {
  const cookieStore = await cookies();
  const token = cookieStore.get("da_session")?.value ?? null;
  const user = getUserBySession(token);
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
