import { getUserServerSession } from "@/lib/auth";
import SignUpForm from "./_components/signup-form";
import { redirect } from "next/navigation";
interface Props {
  searchParams: Promise<{ phone: string }>;
}
export default async function SignUpPage({ searchParams }: Props) {

  const user = await getUserServerSession();

  if (user) {
    redirect('/plans');
  }

  const { phone = null } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center">
      <SignUpForm phone={phone} />
    </main>
  );
}
