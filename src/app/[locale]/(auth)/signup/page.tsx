import  SignUpForm  from "./_components/signup-form"
import Header from "@/components/header";


interface Props {
  searchParams: Promise<{ phone: string }>;
}
export default async function SignUpPage({searchParams}: Props) {

  const {phone = null}= await searchParams;
  return (
    <>
      <Header />
      <main className="flex min-h-screen items-center justify-center">
      <SignUpForm phone={phone}/>
      </main>
    </>
  );
}
