import React from "react";

import { LoginForm } from "./_components/login-form";

export default async function Login() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <LoginForm />
    </main>
  );
}
