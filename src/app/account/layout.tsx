import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getUserBySession, SESSION_COOKIE_NAME } from "@/lib/auth";

export default async function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
  const user = await getUserBySession(token);

  if (!user) {
    redirect("/login?next=/account");
  }

  return children;
}
