import MaxWidthWrapper from "@/components/max-width-wrapper";
import { PLANS } from "@/config/pricing";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getUserServerSession } from "@/lib/auth";
import PlanCard from "./_components/plan-card";
import { getUserSubscriptionPlan } from "@/lib/lemonsqueezy";

type Props = {};

export default async function Page({}: Props) {
  const user = await getUserServerSession();
  const subscription_plan = await getUserSubscriptionPlan();
  const t = await import("next-intl/server").then((mod) =>
    mod.getTranslations("pricing_page"),
  );

  const pricingItems = [
    {
      plan: t("plans.starter.name"),
      tagline: t("plans.starter.tagline"),
      quota: PLANS.find((p) => p.slug === "starter")!.quota,
      features: [
        { text: t("plans.starter.features.whatsapp_reminders") },
        {
          text: t("plans.starter.features.voice_recognition.text"),
          footnote: t("plans.starter.features.voice_recognition.footnote"),
        },
        {
          text: t("plans.starter.features.image_recognition.text"),
          footnote: t("plans.starter.features.image_recognition.footnote"),
          negative: true,
        },
        {
          text: t("plans.starter.features.early_access.text"),
          negative: true,
        },
        {
          text: t("plans.starter.features.priority_support.text"),
          negative: true,
        },
      ],
    },
    {
      plan: t("plans.pro.name"),
      tagline: t("plans.pro.tagline"),
      quota: PLANS.find((p) => p.slug === "pro")!.quota,
      features: [
        { text: t("plans.pro.features.whatsapp_reminders") },
        {
          text: t("plans.pro.features.voice_recognition.text"),
          footnote: t("plans.pro.features.voice_recognition.footnote"),
        },
        {
          text: t("plans.pro.features.image_recognition.text"),
          footnote: t("plans.pro.features.image_recognition.footnote"),
        },
        { text: t("plans.pro.features.early_access.text") },
        { text: t("plans.pro.features.priority_support.text") },
      ],
    },
  ];

  return (
    <MaxWidthWrapper className="mb-8 mt-12 md:mt-24 text-center max-w-5xl">
      <div className="mx-auto mb-10 sm:max-w-lg">
        <h1 className="text-6xl font-bold sm:text-7xl">{t("title")}</h1>
        <p className="mt-5 text-gray-400 sm:text-lg">{t("subtitle")}</p>
      </div>
      <div className="pt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <TooltipProvider>
          {pricingItems.map(({ plan, tagline, quota, features }) => {
            const price =
              PLANS.find((p) => p.slug === plan.toLowerCase())?.price.amount ||
              0;
            return (
              <PlanCard
                key={plan}
                plan={plan}
                tagline={tagline}
                quota={quota}
                features={features}
                price={price}
                isPro={plan === t("plans.pro.name")}
                user={user}
                subscription_plan={subscription_plan}
                t={t}
              />
            );
          })}
        </TooltipProvider>
      </div>
    </MaxWidthWrapper>
  );
}
