import { useTranslations } from "next-intl";
import { redirect } from "next/navigation";
import { getUserServerSession } from "@/lib/auth";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import PlanCard from "./_components/plan-card";
import PlanNumber from "./_components/plan-number";
import { getTranslations } from "next-intl/server";

export default async function Page() {
  const user = await getUserServerSession();
  if (!user) {
    redirect("/login");
  }
  const t = await getTranslations("account_page");

  return (
    <MaxWidthWrapper className="mb-8 mt-24 text-center max-w-5xl">
      <div className="mb-10">
        <h1 className="text-4xl font-bold sm:text-5xl">{t("title")}</h1>
        <p className="text-base text-muted-foreground ">{t("subtitle")}</p>
      </div>
      <div className="mx-auto mb-10 sm:max-w-lg flex flex-col gap-10">
        <PlanCard />
        <PlanNumber number={user.phone} />
      </div>
    </MaxWidthWrapper>
  );
}
