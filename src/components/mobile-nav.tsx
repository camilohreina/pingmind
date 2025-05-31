"use client";
import { ArrowRight, Menu } from "lucide-react";
import { Link } from "@/i18n/routing";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { Button } from "./ui/button";
import SignOutButton from "./sign-out-button";
import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "./ui/dropdown-menu";
import { Globe } from "lucide-react";

type Props = {
  isAuth: boolean;
};

const locales = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
];

function LocaleSwitcherMobile() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    // Remove the current locale from the pathname
    const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";
    // Navigate to the new locale
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  const currentLocale = locales.find((l) => l.code === locale) || locales[0];

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="flex w-full items-center gap-2">
        <Globe className="size-4" />
        <span>{currentLocale.name}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {locales.map((localeOption) => (
          <DropdownMenuItem
            key={localeOption.code}
            onClick={() => handleLocaleChange(localeOption.code)}
            className="flex items-center gap-2"
          >
            <span>{localeOption.flag}</span>
            <span>{localeOption.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

function MobileNavContent({ isAuth }: { isAuth: boolean }) {
  const t = useTranslations("home_page.header");
  const pathname = usePathname();

  const handleLinkClick = (href: string) => {
    if (pathname === href) {
      return;
    }
  };

  if (!isAuth) {
    return (
      <>
        <DropdownMenuItem asChild>
          <Link
            onClick={() => handleLinkClick("/login")}
            className="flex items-center font-semibold"
            href="/login"
          >
            {t("signup")}
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            onClick={() => handleLinkClick("/plans")}
            className="flex items-center w-full font-semibold"
            href="/plans"
          >
            {t("pricing")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            onClick={() => handleLinkClick("/privacy")}
            className="flex items-center w-full font-semibold"
            href="/privacy"
          >
            {t("privacy")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <LocaleSwitcherMobile />
      </>
    );
  }

  return (
    <>
      <DropdownMenuItem asChild>
        <Link
          onClick={() => handleLinkClick("/account")}
          className="flex items-center w-full font-semibold"
          href="/account"
        >
          {t("account")}
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link
          onClick={() => handleLinkClick("/plans")}
          className="flex items-center w-full"
          href="/plans"
        >
          {t("pricing")}
        </Link>
      </DropdownMenuItem>{" "}
      <DropdownMenuItem asChild>
        <Link
          onClick={() => handleLinkClick("/privacy")}
          className="flex items-center w-full"
          href="/privacy"
        >
          {t("privacy")}
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <LocaleSwitcherMobile />
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <SignOutButton />
      </DropdownMenuItem>
    </>
  );
}

export default function MobileNav({ isAuth: initialIsAuth }: Props) {
  const { data: session } = useSession();
  const isAuth = session?.user ? true : initialIsAuth;

  return (
    <div className="sm:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative z-50 text-zinc-700 hover:bg-transparent"
          >
            <Menu className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[180px] bg-zinc-950 border-zinc-800"
        >
          <MobileNavContent isAuth={isAuth} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
