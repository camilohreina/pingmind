import { APP_NAME } from '@/config/constants';
import { Metadata } from 'next';

interface PageSEOProps {
  title: string;
  description?: string;
  canonicalUrl?: string;
  ogType?: string;
  ogImage?: string;
  twitterCard?: string;
  keywords?: string[];
  icon?: string;
}

export function customMetaDataGenerator({
  title,
  description = 'PingMind es una plataforma de recordatorios y notificaciones por WhatsApp. ¡Prueba gratis por 3 días y descubre todas sus funcionalidades!',
  canonicalUrl = 'https://snipspot.app',
  icon = '/apple-icon.png',
  ogType = 'website',
  keywords = [
    'recordatorios de citas',
    'whatsapp',
    'reservas',
    'chatbot whatsapp',
    'small reminders',
    'reminders',
    'recordatorios',
    'whatsapp chatbot',
    'notificaciones',
    'notificaciones de citas',
    'notifications',
  ],
  ogImage = 'https://snipspot.app/og-snipspot.webp',
  twitterCard = 'summary_large_image',
}: PageSEOProps): Metadata {
  // Create Site Title
  const siteTitle = APP_NAME;
  const fullTitle = `${title} | ${siteTitle}`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      type: 'website',
      title: fullTitle,
      description,
      url: canonicalUrl,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image'!,
      title: fullTitle,
      description,
      images: [ogImage],
      creator: '@xdiffernt',
    },
    alternates: {
      canonical: canonicalUrl,
    },
    manifest: '/manifest.json',
    icons: {
      apple: icon,
    },
    appleWebApp: {
      startupImage: icon,
    },
  };
}