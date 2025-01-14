import type {Metadata} from "next";

import {routing} from "@/i18n/routing";

import {NextIntlClientProvider} from "next-intl";
import "./globals.css";
import {getMessages, setRequestLocale} from "next-intl/server";
import {notFound} from "next/navigation";

import {Link} from "@/i18n/routing";

export const metadata: Metadata = {
  title: "pingmind",
  description: "Generated by appncy",
};

interface Props {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function RootLayout({children, params}: Props) {
  const {locale} = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="scheme-light dark:scheme-dark bg-background text-foreground container m-auto grid min-h-screen grid-rows-[auto_1fr_auto] gap-8 px-4 font-sans antialiased">
        <NextIntlClientProvider messages={messages} timeZone="UTC">
          {/*           <header className="text-xl font-bold leading-[4rem]">
            <Link href="/">pingmind</Link>
            <Link className="mx-5" href="/login">login</Link>
          </header> */}
          {children}
          <footer className="text-center leading-[4rem] opacity-70">pingmind</footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
