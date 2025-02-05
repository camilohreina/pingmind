"use client";
import React from "react";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

type Props = {};

export default function SignInButton({}: Props) {
  const t = useTranslations("home_page.header");
  return (
    <Button asChild variant="default" size="sm">
      <Link href="/login">
        {t("signup")} <ArrowRight className="ml-1.5 size-5" />
      </Link>
    </Button>
  );
}
