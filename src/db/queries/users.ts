import { db } from "..";
import { users } from "../schema/users";

type newUser = typeof users.$inferInsert;

const insertNewUser = async (user: newUser) => {
  return db.insert(users).values(user).execute();
};
