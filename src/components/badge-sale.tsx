import { useTranslations } from "next-intl";
import React from "react";

export default function BadgeSale() {
  const t = useTranslations("home_page");

  return (
    <div className="mx-auto flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-white/30 px-7 py-2 shadow-md backdrop-blur transition-all">
      <p className="text-nowrap bg-gradient-to-t from-white to-white/40 bg-clip-text text-sm text-transparent lg:text-base">
        {t.rich("badge_sale", {
          strong: (children) => <span className="font-bold">{children}</span>,
        })}
      
      </p>
    </div>
  );
}
