import React from "react";

import { LoginForm } from "./_components/login-form";
import Header from "@/components/header";

export default async function Login() {
  return (
    <>
      <Header />
      <main className="flex min-h-screen items-center justify-center">
        <LoginForm />
      </main>
    </>
  );
}
