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

export const getUserById = async (id: string) => {
  return db.query.users.findFirst({
    where: eq(users.id, id),
  });
};

export const saveResetPasswordCode = (code: string) => {
  return db.update(users).set({
    reset_password_code: code,
    reset_password_expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutos
  });
};
