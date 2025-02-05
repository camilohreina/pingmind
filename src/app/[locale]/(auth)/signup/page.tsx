import SignUpForm from "./_components/signup-form";
interface Props {
  searchParams: Promise<{ phone: string }>;
}
export default async function SignUpPage({ searchParams }: Props) {
  const { phone = null } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center">
      <SignUpForm phone={phone} />
    </main>
  );
}
