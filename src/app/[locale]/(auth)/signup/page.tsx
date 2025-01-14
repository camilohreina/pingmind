import  SignUpForm  from "./_components/signup-form"
import Header from "@/components/header";

export default async function SignUpPage() {
  return (
    <>
      <Header />
      <main className="flex min-h-screen items-center justify-center">
      <SignUpForm />
      </main>
    </>
  );
}
