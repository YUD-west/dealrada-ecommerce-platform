"use client";

import AuthNav from "@/components/AuthNav";
import useLanguage from "@/components/useLanguage";

/** Sign up / Sign in (or account / sign out) for shop headers outside the home page. */
export default function PublicHeaderAuth() {
  const language = useLanguage();
  const labels =
    language === "am"
      ? {
          signUp: "ተመዝግብ",
          signIn: "ግባ",
          signOut: "ውጣ",
          account: "መለያ",
        }
      : {
          signUp: "Sign up",
          signIn: "Sign in",
          signOut: "Sign out",
          account: "Account",
        };

  return (
    <AuthNav
      variant="header"
      labels={{
        signUp: labels.signUp,
        signIn: labels.signIn,
        signOut: labels.signOut,
        account: labels.account,
      }}
    />
  );
}
