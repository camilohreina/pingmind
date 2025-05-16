"use client";
import React from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { useExchangeRates } from "@/hooks/use-exchanges-rates";
import { Skeleton } from "@/components/ui/skeleton";

type CurrencyInfo = {
  country: string;
  flag: string;
  currency: string;
};

const currencies: CurrencyInfo[] = [
  {
    country: "Colombia",
    flag: "🇨🇴",
    currency: "COP",
  },
  {
    country: "México",
    flag: "🇲🇽",
    currency: "MXN",
  },
  {
    country: "Argentina",
    flag: "🇦🇷",
    currency: "ARS",
  },
  {
    country: "Europa",
    flag: "🇪🇺",
    currency: "EUR",
  },
];

interface LocalPricingProps {
  price: number;
  className?: string;
}

export default function LocalPricing({ price, className }: LocalPricingProps) {
  const { rates, loading, error } = useExchangeRates();

  if (error) {
    return null;
  }

  if (loading) {
    return (
      <div className={cn("grid grid-cols-2 gap-2 mt-2", className)}>
        {currencies.map((curr) => (
          <Skeleton key={curr.currency} className="h-6 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("text-sm font-bold text-gray-300 mt-2", className)}>
      {currencies.map((curr) => (
        <div key={curr.currency} className="flex items-center gap-1.5">
          <span className="text-lg">{curr.flag}</span>
          <span>
            {rates &&
              formatCurrency(price * rates[curr.currency], curr.currency)}
          </span>
        </div>
      ))}
    </div>
  );
}
