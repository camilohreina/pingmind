"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import UpgradeButton from "./upgrade-button";
import { getUserServerSession } from "@/lib/auth";
import { ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";
import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

type Props = {
  plan: string;
  user: Awaited<ReturnType<typeof getUserServerSession>>;
};

export default function SignUpButton({ plan, user }: Props) {
  const t = useTranslations("pricing_page.plans.button");

  return (
    <>
      {plan === "Starter" ? (
        <>
          {user ? (
            <UpgradeButton slug="starter" />
          ) : (
            <Button
              asChild
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
            <UpgradeButton slug="pro" />
          ) : (
            <Link href="/[locale]/auth/signup" locale="en">
              <Button
                asChild
                className={buttonVariants({
                  className: "w-full",
                  variant: "secondary",
                })}
              >
                {t("signUp")}
                <ArrowRight className="size-5 ml-1.5" />
              </Button>
            </Link>
          )}
        </>
      )}
    </>
  );
}
