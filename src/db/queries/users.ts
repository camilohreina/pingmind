import { and, db, eq, gte } from "..";
import { users } from "../schema/users";

export type UserI = typeof users.$inferInsert;

export const dbCreateUser = async (user: UserI) => {
  return db.insert(users).values(user).execute();
};

const ON_TRIAL_STATUS: subscription_status = "on_trial";

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

export const updateUserTimezone = async (userId: string, timezone: string) => {
  return db
    .update(users)
    .set({
      timezone,
      updated_at: new Date(),
    })
    .where(eq(users.id, userId))
    .execute();
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
  stripeStatus: subscription_status;
  stripeTrialEnd: Date | null;
};

export const createSubscription = async ({
  stripeSubscriptionId,
  stripeCustomerId,
  stripePriceId,
  stripeCurrentPeriodEnd,
  stripeCurrentPeriodStart,
  stripePlanId,
  userId,
  stripeStatus,
  stripeTrialEnd,
}: subscriptionData) => {
  const updateData: Partial<UserI> = {
    stripe_subscription_id: stripeSubscriptionId,
    stripe_customer_id: stripeCustomerId,
    stripe_price_id: stripePriceId,
    stripe_current_period_end: stripeCurrentPeriodEnd,
    stripe_current_period_start: stripeCurrentPeriodStart,
    stripe_plan_id: stripePlanId,
    stripe_status: stripeStatus,
    stripe_trial_end: stripeTrialEnd,
  };
  if (stripeStatus === ON_TRIAL_STATUS) {
    updateData.has_used_trial = true;
  }
  return db.update(users).set(updateData).where(eq(users.id, userId));
};

interface updateSubscriptionData {
  stripePriceId: string;
  stripePlanId: string;
  stripeCurrentPeriodEnd: Date;
  stripeCurrentPeriodStart: Date;
  stripeStatus: subscription_status;
  stripeTrialEnd: Date | null;
  userId: string;
}

export const updateSubscription = async ({
  stripePriceId,
  stripePlanId,
  stripeCurrentPeriodEnd,
  userId,
  stripeTrialEnd,
  stripeStatus,
}: updateSubscriptionData) => {
  const updateData: Partial<UserI> = {
    stripe_price_id: stripePriceId,
    stripe_current_period_end: stripeCurrentPeriodEnd,
    stripe_plan_id: stripePlanId,
    stripe_status: stripeStatus,
    stripe_trial_end: stripeTrialEnd,
  };
  if (stripeStatus === ON_TRIAL_STATUS) {
    updateData.has_used_trial = true;
  }
  return db.update(users).set(updateData).where(eq(users.id, userId));
};

export const createTrial = async ({ user_id, end_trial }: { user_id: string, end_trial: Date }) => {
  //son 3 dias de prueba

  return db
    .update(users)
    .set({
      has_used_trial: true,
      stripe_status: ON_TRIAL_STATUS,
      stripe_current_period_end: end_trial,
      stripe_trial_end: end_trial,
    })
    .where(eq(users.id, user_id))
    .execute();
};
