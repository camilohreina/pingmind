import type {AdapterAccount} from "@auth/core/adapters";
import {timestamp, pgTable, text, primaryKey, integer, boolean} from "drizzle-orm/pg-core";

export const users = pgTable("user", {
  id: text("id").notNull().primaryKey(),
  phone: text("phone").notNull().unique(),
  name: text("name"),
  email: text("email"),
  emailVerified: timestamp("email_verified", {mode: "date"}),
  is_active: boolean("is_active").notNull().default(true),
  is_deleted: boolean("is_deleted").notNull().default(false),
  password: text("password").notNull(),
  image: text("image"),
  timezone: text("timezone").notNull().default("UTC"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
  stripe_customer_id: text("stripe_customer_id").unique(),
  stripe_subscription_id: text("stripe_subscription_id").unique(),
  stripe_price_id: text("stripe_price_id"),
  stripe_plan_id: text("stripe_plan_id"),
  stripe_current_period_end: timestamp("stripe_current_period_end", {mode: "date"}),
  reset_password_code: text("reset_password_token"),
  reset_password_expires: timestamp("reset_password_expires", {mode: "date"}),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, {onDelete: "cascade"}),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
  }),
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, {onDelete: "cascade"}),
  expires: timestamp("expires", {mode: "date"}).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", {mode: "date"}).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  }),
);
