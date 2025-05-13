import { and, db, eq, gte } from "..";
import { users } from "../schema/users";

export type UserI = typeof users.$inferInsert;

export const dbCreateUser = async (user: UserI) => {
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

export const saveResetPasswordCode = (phone: string, code: string) => {
  return db
    .update(users)
    .set({
      reset_password_code: code,
      reset_password_expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutos
    })
    .where(eq(users.phone, phone));
};

export const getUserByPhoneAndCode = async (phone: string, code: string) => {
  return db.query.users.findFirst({
    where: and(
      eq(users.phone, phone),
      eq(users.reset_password_code, code),
      gte(users.reset_password_expires, new Date()),
    ),
  });
};

export const updateUserNewPassword = async (
  phone: string,
  password: string,
) => {
  return db
    .update(users)
    .set({
      password: password,
      reset_password_code: null,
      reset_password_expires: null,
    })
    .where(eq(users.phone, phone));
};

type subscriptionData = {
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  stripePriceId: string;
  stripeCurrentPeriodEnd: Date;
  stripeCurrentPeriodStart: Date;
  stripePlanId: string;
  userId: string;
};

export const createSubscription = async ({
  stripeSubscriptionId,
  stripeCustomerId,
  stripePriceId,
  stripeCurrentPeriodEnd,
  stripeCurrentPeriodStart,
  stripePlanId,
  userId,
}: subscriptionData) => {
  return db
    .update(users)
    .set({
      stripe_subscription_id: stripeSubscriptionId,
      stripe_customer_id: stripeCustomerId,
      stripe_price_id: stripePriceId,
      stripe_current_period_end: stripeCurrentPeriodEnd,
      stripe_current_period_start: stripeCurrentPeriodStart,
      stripe_plan_id: stripePlanId,
    })
    .where(eq(users.id, userId));
};

interface updateSubscriptionData {
  stripePriceId: string;
  stripePlanId: string;
  stripeCurrentPeriodEnd: Date;
  stripeCurrentPeriodStart: Date;
  userId: string;
}

export const updateSubscription = async ({
  stripePriceId,
  stripePlanId,
  stripeCurrentPeriodEnd,
  userId,
}: updateSubscriptionData) => {
  return db
    .update(users)
    .set({
      stripe_price_id: stripePriceId,
      stripe_current_period_end: stripeCurrentPeriodEnd,
      stripe_plan_id: stripePlanId,
    })
    .where(eq(users.id, userId));
};
