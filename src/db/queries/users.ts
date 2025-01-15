import { db, eq } from "..";
import { users } from "../schema/users";

type newUser = typeof users.$inferInsert;

export const dbCreateUser = async (user: newUser) => {
  return db.insert(users).values(user).execute();
};

export const dbExistingUser = async (phone: string) => {
  return db.select({
    id: users.id
  }).from(users).where(eq(users.phone, phone));
}