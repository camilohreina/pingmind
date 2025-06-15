"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  createPricingSessionService,
  getSubscriptionUser,
  slugPlan,
} from "@/services/utils.services";
import AdminSubButton from "@/components/admin-sub-button";
import { getUserSubscriptionPlan } from "@/lib/lemonsqueezy";
import TrialSuccessModal from "@/components/trial-success-modal";

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

// Component for button text logic
function ButtonText({
  subscription_plan,
}: {
  subscription_plan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>;
}) {
  const t = useTranslations("pricing_page.plans.button");

  if (subscription_plan?.isSubscribed) {
    return t("upgradeNow");
  }

  if (subscription_plan?.hasUsedTrial) {
    return t("usedFreeTrial");
  }

  return t("signUp");
}

export default function UpgradeButton({ slug, subscription_plan }: Props) {
  const [subscriptionData, setSubscriptionData] =
    useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [trialEndDate, setTrialEndDate] = useState<Date>(new Date());

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
      if (data.trial && data.end_trial) {
        setTrialEndDate(new Date(data.end_trial));
        setShowTrialModal(true);
      } else if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error creating pricing session:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
            <ButtonText subscription_plan={subscription_plan} />
            {isLoading ? (
              <Loader2 className="animate-spin size-3" />
            ) : (
              <ArrowRight className="size-5 ml-1.5" />
            )}
          </>
        </Button>
      )}

      <TrialSuccessModal
        isOpen={showTrialModal}
        onClose={() => setShowTrialModal(false)}
        trialEndDate={trialEndDate}
      />
    </>
  );
}
