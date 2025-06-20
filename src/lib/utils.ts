import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getCountry, getAllCountries } from "countries-and-timezones";
import * as chrono from "chrono-node";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";

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

export function extractMediaId(url: string): string | null {
  const mediaIdMatch = url.match(/\/media\/([^\/]+)/);
  return mediaIdMatch ? mediaIdMatch[1] : null;
}

export function absoluteUrl(path: string): string {
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

export function dateFromHumanWithTimezone(
  dueDate: string,
  timezone: string,
): Date | null {
  const nowInUserTimezone = toZonedTime(new Date(), timezone);

  const date_converted = chrono.parseDate(
    dueDate,
    {
      instant: nowInUserTimezone,
      timezone,
    },
    {
      forwardDate: true,
    },
  );

  if (!date_converted) {
    return null;
  }
  // Luego convertimos a UTC
  const utcDate = fromZonedTime(date_converted, timezone);

  return utcDate;
}

export const getTimezonesFromCountry = (countryCode: string) => {
  const country = getCountry(countryCode);
  const timezones_format: Array<{
    value: string;
    label: string;
    country: string;
    id: string;
  }> = [];

  if (!country) return timezones_format;

  country.timezones.forEach((tz) => {
    timezones_format.push({
      value: tz,
      label: `${tz} (${country.name})`,
      country: country.name,
      id: `${tz}-${country.id}`,
    });
  });

  return timezones_format;
};

export const searchTimezones = (query: string) => {
  if (!query || query.trim() === "") return [];

  const countries = getAllCountries();
  const timezones: Array<{
    value: string;
    label: string;
    country: string;
    id: string;
  }> = [];
  const queryLower = query.toLowerCase().trim();
  const seen = new Set<string>(); // Para evitar duplicados

  Object.values(countries).forEach((country) => {
    // Buscar tanto por nombre de país como por timezone
    const countryMatches = country.name.toLowerCase().includes(queryLower);

    country.timezones.forEach((tz) => {
      const timezoneMatches = tz.toLowerCase().includes(queryLower);

      if ((countryMatches || timezoneMatches) && !seen.has(tz)) {
        seen.add(tz);
        timezones.push({
          value: tz,
          label: `${tz} (${country.name})`,
          country: country.name,
          id: `${tz}-${country.id}`, // ID único
        });
      }
    });
  });

  // Ordenar por relevancia: primero los que coinciden con el nombre del timezone
  timezones.sort((a, b) => {
    const aTimezoneMatch = a.value.toLowerCase().includes(queryLower);
    const bTimezoneMatch = b.value.toLowerCase().includes(queryLower);

    if (aTimezoneMatch && !bTimezoneMatch) return -1;
    if (!aTimezoneMatch && bTimezoneMatch) return 1;
    return a.value.localeCompare(b.value);
  });

  return timezones.slice(0, 20); // Limitar resultados
};

export const getTrialEndDate = (): Date => {
  // 3 días de prueba
  return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
};

export const toZonedTimeReminder = (
  date: Date | null,
  timezone: string,
): string | null => {
  if (!date || !timezone) return null;
  return formatInTimeZone(date, timezone, 'yyyy-MM-dd HH:mm:ssXXX')
};
