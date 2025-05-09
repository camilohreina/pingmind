"use client";
import React from "react";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

type Props = {};

export default function SignOutButton({}: Props) {
  const t = useTranslations("home_page.header");
  return (
    <button
      className="w-full text-start text-red-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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
