import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth, { DefaultSession } from "next-auth";
import { accounts, db, is, sessions, users, verificationTokens } from "@/db";
import type { Adapter } from "next-auth/adapters";
import { getUserByPhone } from "@/db/queries/users";
import { compare } from "bcrypt";
import { ValidationError } from "./error";
import { encode } from "@auth/core/jwt";
import authConfig from "./auth.config";

declare module "next-auth" {
  interface User {
    id?: string;
    phone?: string;
  }

  interface Session {
    user: {
      id: string;
      phone: string;
    } & DefaultSession["user"];
  }
}

const adapter = DrizzleAdapter(db, {
  usersTable: users,
  accountsTable: accounts,
  sessionsTable: sessions,
  verificationTokensTable: verificationTokens,
}) as Adapter;

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter,
  pages: {
    signIn: "/es/login",
    error: "/es/login",
  },
  providers: [
    Credentials({
      credentials: {
        phone: {},
        password: {},
      },
      authorize: async (credentials) => {
        if (!credentials.phone || !credentials.password) {
          return null;
        }

        const { phone, password } = credentials;
        const user = await getUserByPhone(phone as string);
        
        if (!user) {
          return null;
        }

        const isValid = await compare(
          password as string,
          user.password as string,
        );
        console.log({ isValid, password, userPassword: user.password });
        if (isValid) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            phone: user.phone,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account?.provider === "credentials") {
        token.credentials = true;
        // Añadir el id del usuario al token
        if (user?.id) {
          token.id = user.id;
        }
        // Añadir el teléfono del usuario al token
        if (user?.phone) {
          token.phone = user.phone;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Añadir el id del token a la sesión
      if (token?.id) {
        session.user.id = token.id as string;
      }
      // Añadir el teléfono del token a la sesión
      if (token?.phone) {
        session.user.phone = token.phone as string;
      }
      return session;
    },
  },
  jwt: {
    encode: async function (params) {
      // Solo crear la sesión en la base de datos si es un nuevo inicio de sesión
      if (params?.token?.credentials && !params.token?.sessionToken) {
        const sessionToken = crypto.randomUUID();

        if (!params.token?.sub) {
          throw new ValidationError("No user ID found in token");
        }

        const createdSession = await adapter.createSession?.({
          sessionToken,
          userId: params.token.sub,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        });

        if (!createdSession) {
          throw new ValidationError("Failed to create session");
        }

        params.token.sessionToken = sessionToken;
      }
      return encode(params);
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});

export const session = async ({ session, token }: any) => {
  session.user.id = token.id;
  session.user.phone = token.phone;
  return session;
};

export async function getUserServerSession() {
  const authUserSession = await auth();
  const user = authUserSession?.user;
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user?.email,
    first_name: user?.name,
    last_name: "",
    picture: user?.image,
    phone: user?.phone,
  };
}
