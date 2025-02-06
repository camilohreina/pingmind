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

export function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
