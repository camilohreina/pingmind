import { useTranslations } from "next-intl";
import { redirect } from "next/navigation";
import { getUserServerSession } from "@/lib/auth";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import PlanCard from "./_components/plan-card";
import PlanNumber from "./_components/plan-number";
import TimezoneCard from "./_components/timezone-card";
import { getTranslations } from "next-intl/server";
import { getUserSubscriptionPlan } from "@/lib/lemonsqueezy";
import SubscriptionCard from "./_components/subscription-card";
import AccountSkeleton from "./_components/account-skeleton";
import { Suspense } from "react";

async function AccountContent() {
  const user = await getUserServerSession();
  if (!user) {
    redirect("/login");
  }
  const t = await getTranslations("account_page");
  const subscription_plan = await getUserSubscriptionPlan();
  return (
    <MaxWidthWrapper className="mb-8 mt-12 md:mt-24 text-center max-w-5xl">
      <div className="mb-10">
        <h1 className="text-4xl font-bold sm:text-5xl">{t("title")}</h1>
        <p className="text-base text-muted-foreground ">{t("subtitle")}</p>
      </div>
      <div className="mx-auto mb-10 sm:max-w-lg flex flex-col gap-10">
        {subscription_plan?.isSubscribed ? (
          <SubscriptionCard subscription={subscription_plan} />
        ) : (
          <PlanCard />
        )}
        <PlanNumber number={user.phone} />
        <TimezoneCard currentTimezone={user.timezone} userId={user.id} />
      </div>
    </MaxWidthWrapper>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<AccountSkeleton />}>
      <AccountContent />
    </Suspense>
  );
}
