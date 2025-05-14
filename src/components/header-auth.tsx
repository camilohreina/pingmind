"use client";
import { useSession } from "next-auth/react";
import SignInButton from "./sign-in-button";
import { UserAccountNav } from "./account-dropdown";

export function HeaderAuth() {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return null;
  }

  return (
    <>
      {!session?.user ? (
        <SignInButton />
      ) : (
        <UserAccountNav
          name={session.user.name || "Your Account"}
          email={session.user.email || undefined}
          imageUrl={session.user.image || ""}
        />
      )}
    </>
  );
}
