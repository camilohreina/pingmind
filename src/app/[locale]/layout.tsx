import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { NextIntlClientProvider } from "next-intl";
import "./globals.css";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Providers from "@/components/Providers";
import Navbar from "@/components/header";
import { customMetaDataGenerator } from "@/lib/seo";

export const metadata: Metadata = customMetaDataGenerator({
  title: "Your Personal AI That Never Forgets",
});

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <NextIntlClientProvider messages={messages} timeZone="UTC">
        <Providers>
          <body className="scheme-light dark:scheme-dark bg-background text-foreground min-h-screen font-sans antialiased">
            <Navbar />
            {children}
            <footer className="text-center leading-[4rem] opacity-70">
              pingmind
            </footer>
          </body>
        </Providers>
      </NextIntlClientProvider>
    </html>
  );
}
