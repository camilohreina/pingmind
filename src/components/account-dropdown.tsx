"use client";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import SignOutButton from "./sign-out-button";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

type Props = {
  email: string | undefined;
  imageUrl: string;
  name: string;
};

export function UserAccountNav({ email, imageUrl, name }: Props) {
  const t = useTranslations("home_page.header");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="overflow-visible">
        <Button className="" variant={"ghost"} size={"sm"}>
          {t("account")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-0.5 leading-none">
            {name && <p className="font-medium text-sm">{name}</p>}
            {email && (
              <p className="w-[200px] truncate text-sm text-zinc-700">
                {email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/account">{t("account")}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <SignOutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
