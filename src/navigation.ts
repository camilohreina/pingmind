import {createNavigation} from 'next-intl/navigation';
import {locales, localePrefix, pathnames } from "@/config"

export const {Link, getPathname, redirect,  usePathname, useRouter} = createNavigation({
locales,
localePrefix,
}) 