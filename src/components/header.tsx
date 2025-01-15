"use client";

import React, { useEffect, useState } from "react";
import { ChevronRight, Menu } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function Header() {
  const t = useTranslations("home_page.header"); // Hook para traducciones dinámicas
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className="fixed top-0 z-50 flex h-16 w-full items-center gap-4 bg-transparent px-4 md:px-6">
      {/* Fondo dinámico basado en el scroll */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-md transition-opacity ease-in-out"
        style={{ opacity: Math.min(scrollY / 270, 1) }}
      />
      <nav className="container relative z-10 px-4 sm:px-6 lg:px-8">
        {/* Vista Desktop */}
        <div className="mx-auto hidden md:block">
          <div className="flex h-16 items-center justify-between sm:h-20">
            <Link href="/" className="flex items-center text-xl font-bold leading-[4rem]">
              {t("title")}
            </Link>
            {/* Menú de navegación (opcional) */}
            {/* 
            <div className="flex items-baseline space-x-6">
              <Link
                className="rounded-xl text-sm text-slate-400 font-medium hover:text-slate-200 transition duration-150"
                href="#services"
              >
                {t("services")}
              </Link>
              <Link
                className="rounded-xl text-sm text-slate-400 font-medium hover:text-slate-200 transition duration-150"
                href="#working"
              >
                {t("how_it_works")}
              </Link>
              <Link
                className="rounded-xl text-sm text-slate-400 font-medium hover:text-slate-200 transition duration-150"
                href="#pricing"
              >
                {t("pricing")}
              </Link>
              <Link
                className="rounded-xl text-sm text-slate-400 font-medium hover:text-slate-200 transition duration-150"
                href="#contact"
              >
                {t("contact")}
              </Link>
            </div> 
            */}
            <div className="flex gap-x-3">
              {/* Botón de iniciar sesión */}
              {/* 
              <Button asChild variant="ghost">
                <Link
                  className="rounded-xl text-base! text-slate-400 transition duration-150 hover:text-slate-200"
                  href="/login"
                >
                  {t("login")}
                </Link>
              </Button> 
              */}
              <Button asChild className="rounded-xl" variant="secondary">
                <Link className="text-base!" href="/login">
                  {t("login")}
                  <ChevronRight className="ml-2 size-4 animate-pulse" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Vista Mobile */}
        <div className="flex w-full flex-row content-center items-center justify-between md:hidden">
          {t("title")}
          <Sheet>
            <SheetTrigger>
              <Button className="shrink-0 md:hidden" size="icon" variant="outline">
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t("menu_open")}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="grid gap-6 text-lg font-medium">
                {t("title")}
                <div className="flex flex-col items-baseline">
                  <Button asChild variant="secondary">
                    <Link
                      className="my-2 w-full rounded-xl font-medium text-slate-200 transition duration-150 hover:text-slate-200"
                      href="/login"
                    >
                      {t("login")}
                    </Link>
                  </Button>
                  <Button asChild className="my-2 rounded-xl" variant="default">
                    <Link className="w-full" href="/login">
                      {t("login")}
                    </Link>
                  </Button>
                  {/* Opciones adicionales del menú */}
                  {/* 
                  <Link
                    className="flex items-center justify-between text-md w-full border-b border-slate-200 py-4 font-semibold text-slate-400 transition duration-200 ease-in-out last:border-none hover:text-slate-300"
                    href="#services"
                  >
                    {t("services")}
                  </Link>
                  <Link
                    className="flex items-center justify-between text-md w-full border-b border-slate-200 py-4 font-semibold text-slate-400 transition duration-200 ease-in-out last:border-none hover:text-slate-300"
                    href="#working"
                  >
                    {t("how_it_works")}
                  </Link>
                  <Link
                    className="flex items-center justify-between text-md w-full border-b border-slate-200 py-4 font-semibold text-slate-400 transition duration-200 ease-in-out last:border-none hover:text-slate-300"
                    href="#pricing"
                  >
                    {t("pricing")}
                  </Link>
                  <Link
                    className="flex items-center justify-between text-md w-full border-b border-slate-200 py-4 font-semibold text-slate-400 transition duration-200 ease-in-out last:border-none hover:text-slate-300"
                    href="#contact"
                  >
                    {t("contact")}
                  </Link>
                  */}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
