import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserBySession, type AuthUser } from "@/lib/auth";

type GuardResult = { user: AuthUser } | { response: NextResponse };

export async function requireRoles(roles: string[]): Promise<GuardResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get("da_session")?.value ?? null;
  const user = getUserBySession(token);

  if (!user) {
    return {
      response: NextResponse.json({ error: "Not authenticated." }, { status: 401 }),
    };
  }

  // ADMIN can access all protected role-based routes.
  if (user.role === "ADMIN" || roles.includes(user.role)) {
    return { user };
  }

  return {
    response: NextResponse.json({ error: "Access denied." }, { status: 403 }),
  };
}

