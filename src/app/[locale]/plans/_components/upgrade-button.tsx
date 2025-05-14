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

type Props = {
  slug: slugPlan;
};

type SubscriptionData = {
  slug: string;
  is_subscribed: boolean;
  is_cancelled: boolean;
  stripe_current_period_end: string | null;
};

export default function UpgradeButton({ slug }: Props) {
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
    <Button
      onClick={() => create_pricing_session(slug)}
      className="w-full"
      disabled={isLoading}
    >
      {subscriptionData?.is_subscribed && subscriptionData.slug === slug
        ? t("manageSubscription")
        : t("upgradeNow")}
      <ArrowRight className="size-5 ml-1.5" />
    </Button>
  );
}
