import { db, eq } from "..";
import { users } from "../schema/users";

type newUser = typeof users.$inferInsert;

export const dbCreateUser = async (user: newUser) => {
  return db.insert(users).values(user).execute();
};

export const getUserByPhone = async (phone: string) => {
  //si el phone incluye el + no se hace nada, sino se le agrega
  if (!phone.includes("+")) {
    phone = "+" + phone;
  }

  return db.query.users.findFirst({
    where: eq(users.phone, phone),
  });
};
