import React from "react";
import { LoginForm } from "./_components/login-form";
import { getUserServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Login() {
  const user = await getUserServerSession();

  if (user) {
    redirect("/account");
  }
  return (
    <main className="flex min-h-screen items-center justify-center">
      <LoginForm />
    </main>
  );
}
