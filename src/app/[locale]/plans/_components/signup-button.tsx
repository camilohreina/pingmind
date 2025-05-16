"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import UpgradeButton from "./upgrade-button";
import { getUserServerSession } from "@/lib/auth";
import { ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";
import React from "react";
import { useTranslations } from "next-intl";
import { getUserSubscriptionPlan } from "@/lib/lemonsqueezy";

type Props = {
  plan: string;
  user: Awaited<ReturnType<typeof getUserServerSession>>;
  subscription_plan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>;
};

export default function SignUpButton({ plan, user, subscription_plan }: Props) {
  const t = useTranslations("pricing_page.plans.button");

  return (
    <>
      {plan === "Starter" ? (
        <>
          {user ? (
            <UpgradeButton
              slug="starter"
              subscription_plan={subscription_plan}
            />
          ) : (
            <Button
              className={buttonVariants({
                className: "w-full",
                variant: "secondary",
              })}
              onClick={() => signIn()}
            >
              {t("signUp")}
              <ArrowRight className="size-5 ml-1.5" />
            </Button>
          )}
        </>
      ) : (
        <>
          {user ? (
            <UpgradeButton slug="pro" subscription_plan={subscription_plan} />
          ) : (
            <Button
              className={buttonVariants({
                className: "w-full",
                variant: "secondary",
              })}
              onClick={() => signIn()}
            >
              {t("signUp")}
              <ArrowRight className="size-5 ml-1.5" />
            </Button>
          )}
        </>
      )}
    </>
  );
}
