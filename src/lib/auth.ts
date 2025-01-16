import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import { db } from "@/db";
import type { Adapter } from "next-auth/adapters";
import { getUserByPhone } from "@/db/queries/users";
import { compare } from "bcrypt";

export const { auth, handlers, signIn } = NextAuth({
  adapter: DrizzleAdapter(db) as Adapter,
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
        const [user] = await getUserByPhone(phone as string);
        console.log(user);
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
});
