import { db, eq } from "..";
import { users } from "../schema/users";

type newUser = typeof users.$inferInsert;

export const dbCreateUser = async (user: newUser) => {
  return db.insert(users).values(user).execute();
};


export const getUserByPhone = async (phone: string) => {
  return db.query.users.findFirst({
    where: eq(users.phone, phone)
  })
}