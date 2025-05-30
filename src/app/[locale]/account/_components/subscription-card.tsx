import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { getUserSubscriptionPlan } from "@/lib/lemonsqueezy";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import React from "react";
import AdminSubButton from "@/components/admin-sub-button";

type Props = {
  subscription: Awaited<ReturnType<typeof getUserSubscriptionPlan>>;
};

export default function SubscriptionCard({ subscription }: Props) {
  const t = useTranslations("account_page.subscription_card");

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl text-left">{t("title")}</CardTitle>
        <CardDescription>
          <p className="text-left">
            {t("description", { planName: subscription.name })}
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-start">
        <p className="text-3xl font-bold">USD ${subscription.price?.amount}</p>
        <div className="mb-3">
          {subscription.isSubscribed ? (
            <p className="text-xs font-medium">
              {subscription.isCanceled
                ? t("cancellation", {
                    date: format(
                      subscription.stripe_current_period_end!,
                      "dd.MM.yyyy",
                    ),
                  })
                : t("renewal", {
                    date: format(
                      subscription.stripe_current_period_end!,
                      "dd.MM.yyyy",
                    ),
                  })}
            </p>
          ) : null}
        </div>
        <Button asChild variant="secondary" className="w-full" size="sm">
          {subscription.portalUrl && subscription.isSubscribed ? (
            <>
            <AdminSubButton portal_url={subscription.portalUrl} size="sm"/>
            <pre>{JSON.stringify(subscription)}</pre>
            </>
          ) : (
            <Link href="/plans">{t("upgrade_plan")}</Link>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
