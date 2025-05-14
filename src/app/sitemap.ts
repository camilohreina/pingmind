import { APP_URL } from "@/config/constants";
import { MetadataRoute } from "next";

const languages = ["es", "en"]; // Añade aquí todos los idiomas que soporta tu aplicación
const baseUrl = APP_URL; // Reemplaza con tu URL base

// Rutas públicas que no requieren autenticación
const publicRoutes = ["", "login", "signup", "plans"];

// Rutas protegidas que requieren autenticación
const protectedRoutes = ["dashboard", "account"];

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  // Función para crear entrada de sitemap para cada ruta y lenguaje
  const createSitemapEntry = (route: string, lang: string) => {
    const path = route === "" ? "" : `/${route}`;
    return {
      url: `${baseUrl}/${lang}${path}`,
      lastModified: currentDate,
      changeFrequency: "daily" as const,
      priority: route === "" ? 1 : 0.8,
    };
  };

  // Generar entradas para rutas públicas
  const publicEntries = languages.flatMap((lang) =>
    publicRoutes.map((route) => createSitemapEntry(route, lang)),
  );

  // Generar entradas para rutas protegidas
  const protectedEntries = languages.flatMap((lang) =>
    protectedRoutes.map((route) => createSitemapEntry(route, lang)),
  );

  return [...publicEntries, ...protectedEntries];
}
