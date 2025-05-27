"use client"

import { useLocale, useTranslations } from "next-intl"
import { useRouter, usePathname } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe } from "lucide-react"

const locales = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
]

export default function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher")
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleLocaleChange = (newLocale: string) => {
    // Remove the current locale from the pathname
    const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/"

    // Navigate to the new locale
    router.push(`/${newLocale}${pathWithoutLocale}`)
  }


  return (
    <Select value={locale} onValueChange={handleLocaleChange}>
      <SelectTrigger className="">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {locales.map((localeOption) => (
          <SelectItem key={localeOption.code} value={localeOption.code}>
            <div className="flex items-center gap-2">
              <span>{localeOption.flag}</span>
              <span>{localeOption.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

