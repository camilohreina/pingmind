import React from "react";
import MaxWidthWrapper from "./max-width-wrapper";

import { buttonVariants } from "./ui/button";
import UserAccountNav from "./account-dropdown";
import MobileNav from "./mobile-nav";
import { getUserServerSession } from "@/lib/auth";
import SignInButton from "./sign-in-button";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

type Props = {};

export default async function Navbar({}: Props) {
  const user = await getUserServerSession();

  const t = await getTranslations("home_page.header");
  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-zinc-800 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-800">
          <Link href="/" className="flex z-40 font-semibold">
            <span>Pingmind.</span>
          </Link>

          <MobileNav isAuth={!!user} />
          <div className="hidden items-center space-x-4 sm:flex">
            <Link
              href="/plans"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
              })}
            >
              {t("pricing")}
            </Link>
            {!user ? (
              <SignInButton />
            ) : (
              <>
                {/*            <Link
                  href="/dashboard"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                >
                  Dashboard
                </Link> */}
                <UserAccountNav
                  name={
                    !user.first_name && !user.last_name
                      ? "Your account"
                      : `${user.first_name} ${user.last_name}`
                  }
                  email={user.email ?? ""}
                  imageUrl={user.picture ?? ""}
                />
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
}
