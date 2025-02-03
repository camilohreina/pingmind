"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import UpgradeButton from "./upgrade-button";
import { getUserServerSession } from "@/lib/auth";
import { ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";
import React from "react";
import { useTranslations } from "next-intl";

type Props = {
  plan: string;
  user: Awaited<ReturnType<typeof getUserServerSession>>;
};

export default function SignUpButton({ plan, user }: Props) {
  const t = useTranslations("pricing_page.plans.button");

  return (
    <>
      {plan === "Free" ? (
        <Button
          onClick={() => signIn("credentials")}
          className={buttonVariants({
            className: "w-full",
            variant: "secondary",
          })}
        >
          {user ? t("upgradeNow") : t("signUp")}
          <ArrowRight className="size-5 ml-1.5" />
        </Button>
      ) : user ? (
        <UpgradeButton />
      ) : (
        <Button
          onClick={() => signIn("credentials")}
          className={buttonVariants({
            className: "w-full",
          })}
        >
          {user ? t("upgradeNow") : t("signUp")}
          <ArrowRight className="size-5 ml-1.5" />
        </Button>
      )}
    </>
  );
}
