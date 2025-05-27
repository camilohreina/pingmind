import React from "react";
import {useTranslations} from "next-intl";
import {fontHead} from "@/ui/fonts";
import {cn} from "@/lib/utils";

export default function Title() {
  const t = useTranslations("home_page");

  return (
    <h1
      className={cn(
        "inline-block w-full px-3 text-center text-2xl font-bold md:max-w-4xl md:text-6xl lg:text-6xl",
        fontHead.className,
      )}
    >
      {t.rich("title", {
        mark: (chunks) => <span className="text-green-400">{chunks}</span>,
      })}
    </h1>
  );
}
