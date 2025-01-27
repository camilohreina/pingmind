"use client";

import { locales } from "@/config/constants";
import { usePathname, useRouter } from "@/i18n/routing";
import clsx from "clsx";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import React, { useTransition } from "react";

type Props = {
  children: React.ReactNode;
  defaultValue: string;
  label: string;
};

export default function LocalSwitcherSelect({
  children,
  defaultValue,
  label,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const params = useParams();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value;
    startTransition(() => {
      router.replace(
        //@ts-ignore
        { pathname, params },
        { locale: nextLocale },
      );
    });
  }

  return (
    <label
      className={clsx(
        "relative text-gray-400",
        isPending && "transition-opacity [&:disabled] opacity-50",
      )}
    >
      <p className="sr-only">{label}</p>
      <select
        defaultValue={defaultValue}
        disabled={isPending}
        onChange={handleChange}
        className="inline-flex appearance-none bg-transparent py-3 pl-2 pr-6"
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-2 top-[8px]"></span>
    </label>
  );
}

export function LocaleSwitcher() {
  const t = useTranslations("home_page.locale_switcher");
  const local = useLocale();

  return (
    <LocalSwitcherSelect defaultValue={local} label={t("label")}>
      {locales.map((cur) => (
        <option key={cur} value={cur}>
          {t("locale", { locale: cur })}
        </option>
      ))}
    </LocalSwitcherSelect>
  );
}
