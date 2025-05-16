import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import NextAuth from 'next-auth'
import authConfig from '@/lib/auth.config'

const publicPages = [
  '/',
  '/login',
  '/signup',
  '/plans',
  '/reset-password',
  '/input',
  '/voice',
  '/terms',
  '/privacy'
]

const intlMiddleware = createMiddleware(routing)
const { auth } = NextAuth(authConfig)

export default auth((req) => {
  // Ignorar rutas internas de Next.js y recursos estáticos
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.includes('__nextjs_original-stack-frames') ||
    req.nextUrl.pathname.startsWith('/api/')
  ) {
    return;
  }

  const publicPathnameRegex = RegExp(
    `^(/(${routing.locales.join('|')}))?(${publicPages
      .flatMap((p) => (p === '/' ? ['', '/'] : p))
      .join('|')})/?$`,
    'i'
  )
  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname)

  if (isPublicPage) {
    return intlMiddleware(req)
  } else {
    if (!req.auth) {
      const newUrl = new URL(
        `/login?callbackUrl=${encodeURIComponent(req.nextUrl.pathname)}`,
        req.nextUrl.origin
      )
      return Response.redirect(newUrl)
    }
    return intlMiddleware(req)
  }
})

export const config = {
  // Skip all paths that should not be internationalized or are internal
  matcher: ['/((?!api|_next|.*\\..*|__nextjs_original-stack-frames).*)']
}