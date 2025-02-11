"use client";
import { ArrowRight, Menu } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import SignOutButton from "./sign-out-button";
import { useTranslations } from "next-intl";

type Props = {
  isAuth: boolean;
};

export default function MobileNav({ isAuth }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const t = useTranslations("home_page.header");

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) toggleOpen();
  }, [pathname]);

  const closeOnCurrent = (href: string) => {
    if (pathname === href) {
      toggleOpen();
    }
  };

  return (
    <div className="sm:hidden">
      <Menu
        onClick={toggleOpen}
        className="size-5 relative z-50 text-zinc-700"
      />
      {isOpen && (
        <div className="fixed animate-in slide-in-from-top-5 fade-in-20 inset-0 z-0 w-full ">
          <ul className="absolute bg-zinc-950 border-b border-zinc-200 shadow-xl grid w-full gap-3 px-10 pt-20 pb-8">
            {!isAuth ? (
              <>
                <li>
                  <Button
                    onClick={() => signIn("google")}
                    className="flex items-center w-full font-semibold"
                  >
                    {t("signup")}
                    <ArrowRight className="ml-2 size-5" />{" "}
                  </Button>
                </li>

                <li className="my-3 h-px w-full bg-gray-300" />
                <li>
                  <Link
                    onClick={() => closeOnCurrent("/pricing")}
                    className="flex items-center w-full font-semibold "
                    href="/plans"
                  >
                    {t("pricing")}
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    onClick={() => closeOnCurrent("/pricing")}
                    className="flex items-center w-full font-semibold "
                    href="/plans"
                  >
                    {t("pricing")}
                  </Link>
                </li>
                <li className="my-3 h-px w-full bg-gray-300" />

                <li>
                  <SignOutButton />
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
