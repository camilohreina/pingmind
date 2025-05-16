import BadgeSale from "@/components/badge-sale";
import Features from "@/components/features";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import NumberSale from "@/components/number-sale";
import WhatsAppReminderDemo from "@/components/services";
import Title from "@/components/title";
import { getUserServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
export default async function HomePage() {
  const user = await getUserServerSession();

  if (user) {
    redirect("/account");
  }
  return (
    <MaxWidthWrapper className="flex flex-col my-12 min-h-svh items-center justify-center gap-24 text-center">
      <section className="flex flex-col gap-4">
        <BadgeSale />
        <Title />
        <NumberSale />
      </section>
      <WhatsAppReminderDemo />
      <Features />
    </MaxWidthWrapper>
  );
}
