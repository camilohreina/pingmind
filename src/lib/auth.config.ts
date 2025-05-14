import type { NextAuthConfig } from 'next-auth'

export default {
  providers: [],
  callbacks: {
    authorized({ request, auth }) {
      const protectedPaths = [
        /\/dashboard(\/.*)?/,
        /\/account(\/.*)?/
      ]
      const { pathname } = request.nextUrl

      // Ignorar rutas internas y recursos estáticos
      if (
        pathname.startsWith('/_next') ||
        pathname.includes('__nextjs_original-stack-frames') ||
        pathname.startsWith('/api/')
      ) {
        return true
      }

      // Verificar si es una ruta protegida
      if (protectedPaths.some((p) => p.test(pathname))) {
        return !!auth
      }

      return true
    },
  },
} satisfies NextAuthConfig