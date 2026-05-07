import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getUserBySession, SESSION_COOKIE_NAME } from "@/lib/auth";

export default async function SellerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
  const user = await getUserBySession(token);

  if (!user) {
    redirect("/login?next=/seller/dashboard");
  }

  if (user.role !== "SELLER" && user.role !== "ADMIN") {
    redirect("/?error=seller-access");
  }

  return children;
}
