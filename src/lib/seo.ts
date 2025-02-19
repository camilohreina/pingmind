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
  description = 'SnipSpot te facilita la vida: controla tus citas, comparte tu landing page, mantén a tus clientes informados con notificaciones automáticas y más!',
  canonicalUrl = 'https://snipspot.app',
  icon = '/apple-icon.png',
  ogType = 'website',
  keywords = [
    'gestión de citas',
    'reserva de citas',
    'landing page',
    'notificaciones de citas',
    'administración de reservas',
    'organización de citas',
    'recordatorios de citas',
    'sistema de reservas',
    'automatización de notificaciones',
    'control de citas',
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