"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  createPricingSessionService,
  slugPlan,
} from "@/services/utils.services";

type Props = {
  slug: slugPlan;
};

export default function UpgradeButton({slug}: Props) {

  const create_pricing_session = async (slug: slugPlan) => {
    const data = await createPricingSessionService(slug);
    console.log(data);
    if (data?.url){
      window.location.href = data.url;
    }
  };

  const t = useTranslations("pricing_page.plans.button");

  return (
    <Button
      onClick={() => create_pricing_session(slug)}
      className="w-full"
    >
      {t("upgradeNow")} <ArrowRight className="size-5 ml-1.5" />
    </Button>
  );
}
