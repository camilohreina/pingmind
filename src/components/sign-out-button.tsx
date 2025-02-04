"use client";
import React from "react";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

type Props = {};

export default function SignOutButton({}: Props) {
  const t = useTranslations("home_page.header");
  return (
    <button
      className="w-full text-start"
      onClick={() =>
        signOut({
          callbackUrl: "/",
        })
      }
    >
      {t("logout")}
    </button>
  );
}
