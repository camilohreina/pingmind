"use client";
import React from "react";
import { Button } from "./ui/button";
import { signIn, useSession } from "next-auth/react";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {};

export default function SignInButton({}: Props) {
  const t = useTranslations("home_page.header");
  return (
    <Button
      onClick={() => signIn("credentials", { callbackUrl: "/plans" })}
      variant="default"
      size="sm"
    >
      {t('signup')} <ArrowRight className="ml-1.5 size-5" />
    </Button>
  );
}
