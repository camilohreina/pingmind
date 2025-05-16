"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  createPricingSessionService,
  getSubscriptionUser,
  slugPlan,
} from "@/services/utils.services";
import AdminSubButton from "@/components/admin-sub-button";
import { getUserSubscriptionPlan } from "@/lib/lemonsqueezy";

type Props = {
  slug: slugPlan;
  subscription_plan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>;
};

type SubscriptionData = {
  slug: string;
  is_subscribed: boolean;
  is_cancelled: boolean;
  portal_url: string;
  stripe_current_period_end: string | null;
};

export default function UpgradeButton({ slug, subscription_plan }: Props) {
  const [subscriptionData, setSubscriptionData] =
    useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const data = await getSubscriptionUser();
        setSubscriptionData(data);
      } catch (error) {
        console.error("Error fetching subscription:", error);
      }
    };

    fetchSubscription();
  }, []);

  const create_pricing_session = async (slug: slugPlan) => {
    try {
      setIsLoading(true);
      const data = await createPricingSessionService(slug);
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error creating pricing session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const t = useTranslations("pricing_page.plans.button");

  return (
    <>
      {subscription_plan?.isSubscribed && subscription_plan.slug === slug ? (
        <AdminSubButton portal_url={subscription_plan.portalUrl || ""} />
      ) : (
        <Button
          onClick={() => create_pricing_session(slug)}
          className="w-full"
          disabled={isLoading}
        >
          <>
            {subscription_plan?.isSubscribed ? t("upgradeNow") : t("signUp")}
            <ArrowRight className="size-5 ml-1.5" />
          </>
        </Button>
      )}
    </>
  );
}
