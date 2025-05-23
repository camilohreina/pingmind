import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getCountry } from "countries-and-timezones";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getTimeZoneFromCountryCode = (countryCode: string): string => {
  const country = getCountry(countryCode);
  if (!country) return "UTC";

  return country.timezones[0];
};

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function extractMediaId(url: string) {
  const mediaIdMatch = url.match(/\/media\/(\d+)$/);

  return mediaIdMatch ? mediaIdMatch[1] : null;
}

export function absoluteUrl(path: string) {
  if (typeof window === "undefined") return path;
  if (process.env.NEXT_PUBLIC_VERCEL_URL)
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}${path}`;
  return `http://localhost:${process.env.PORT ?? 3000}${path}`;
}

export function formatCurrency(amount: number, currency: string) {
  return amount.toLocaleString("es-ES", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
    notation: "standard",
  });
}
