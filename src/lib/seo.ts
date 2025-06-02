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
  description = 'Pingmind simplifies your life with smart reminders: manage your tasks through WhatsApp, receive timely notifications, and let our AI handle the rest!',
  canonicalUrl = 'https://pingmind.app',
  icon = '/icons/apple-touch-icon.png',
  ogType = 'website',
  keywords = [
    'whatsapp reminders',
    'smart reminders',
    'ai reminders',
    'task management',
    'whatsapp integration',
    'automated notifications',
    'voice reminders',
    'reminder assistant',
    'text reminders',
    'reminder automation',
  ],
  ogImage = 'https://pingmind.app/og-image.webp',
  twitterCard = 'summary_large_image',
}: PageSEOProps): Metadata {
  // Create Site Title
  const siteTitle = APP_NAME;
  const fullTitle = `${siteTitle} | ${title}`;

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
    manifest: '/manifest-og.json',
    icons: {
      apple: icon,
    },
    appleWebApp: {
      startupImage: icon,
    },
  };
}