"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {};

export default function UpgradeButton({}: Props) {
  /*   const { mutate: createPricingSession } =
    trpc.createPricingSession.useMutation({
      onSuccess: ({ url }) => {
        window.location.href = url ?? '/dashboard/billing';
      },
    }); */

  const t = useTranslations("pricing_page.plans.button");

  return (
    <Button
      onClick={() => console.log("create pricing session")}
      className="w-full"
    >
      {t("upgradeNow")} <ArrowRight className="size-5 ml-1.5" />
    </Button>
  );
}
