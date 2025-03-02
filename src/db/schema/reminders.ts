import { pgTable, varchar, timestamp, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

export const reminders = pgTable("reminders", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  text: text("text").notNull(),
  title: varchar("title", { length: 255 }),
  localDate: timestamp("local_date"),
  scheduledAt: timestamp("scheduled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  response: text("response"),
  alert: text("alert"),
  status: varchar("status", {
    length: 50,
    enum: ["PENDING", "COMPLETED", "CANCELLED"],
  }).default("PENDING"),
});

export const reminderRelations = relations(reminders, ({ one }) => ({
  user: one(users, {
    fields: [reminders.userId],
    references: [users.id],
  }),
}));
