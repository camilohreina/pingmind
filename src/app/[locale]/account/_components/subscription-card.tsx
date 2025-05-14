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
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import React from "react";

type Props = {
  subscription: Awaited<ReturnType<typeof getUserSubscriptionPlan>>;
};

export default function SubscriptionCard({ subscription }: Props) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl text-left">Subscription Plan </CardTitle>
        <CardDescription>
          <p className="text-left">
            You are currently on the <strong>{subscription.name}</strong> plan.
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-start">
        <p className="text-3xl font-bold">USD ${subscription.price?.amount}</p>
        {subscription.isSubscribed ? (
          <p className="text-xs font-medium">
            {subscription.isCanceled
              ? "Your subscription is canceled on "
              : "Your plan renews on "}
            {format(subscription.stripe_current_period_end!, "dd.MM.yyyy")}
          </p>
        ) : null}
        <Button asChild variant="secondary" className="w-full mt-3" size="sm">
          {subscription.portalUrl ? (
            <Link href={subscription.portalUrl}>Manage your subscription</Link>
          ) : (
            <Link href="/plans">Upgrade your plan</Link>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
