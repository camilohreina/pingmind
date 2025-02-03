import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import { accounts, db, sessions, users, verificationTokens } from "@/db";
import type { Adapter } from "next-auth/adapters";
import { getUserByPhone } from "@/db/queries/users";
import { compare } from "bcrypt";
import { ValidationError } from "./error";
import { encode } from "@auth/core/jwt";
import authConfig from "./auth.config";

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

        if (isValid) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === "credentials") {
        token.credentials = true;
      }
      return token;
    },
  },
  jwt: {
    encode: async function (params) {
      if (params?.token?.credentials) {
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
      }
      return encode(params);
    },
  },
});




export const session = async ({ session, token }: any) => {
  session.user.id = token.id;
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
    last_name: '',
    picture: user?.image,
  };
}