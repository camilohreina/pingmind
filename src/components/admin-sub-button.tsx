import React from "react";
import { Button } from "./ui/button";
import { Link } from "@/i18n/routing";
import { LemonSqueezy } from "./icons";
import { useTranslations } from "next-intl";

type Props = {
  portal_url: string;
  size?: "sm" | "lg" | "default";
};

export default function AdminSubButton({
  portal_url,
  size = "default",
}: Props) {
  const t = useTranslations("account_page.subscription_card");
  return (
    <Button
      asChild
      variant="secondary"
      className="w-full bg-purple-800"
      size={size}
    >
      <Link href={portal_url}>
        {t("manage_subscription")}
        <LemonSqueezy className="size-6" />
      </Link>
    </Button>
  );
}
