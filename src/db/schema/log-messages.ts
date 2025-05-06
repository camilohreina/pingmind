import { relations } from "drizzle-orm";
import { pgTable, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { users } from "./users";

export const logMessages = pgTable("logMessages", {
  id: varchar("id", { length: 255 }).primaryKey(),
  content: varchar("content", { length: 500 }).notNull(),
  message_id: varchar("message_id", { length: 255 }),
  used_context: boolean("used_context").default(false),
  user_id: varchar("user_id", { length: 255 }),
  is_reply: boolean("is_reply").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});


export const logMessagesRelations = relations(logMessages, ({ one }) => ({
  user: one(users, {
    fields: [logMessages.user_id],
    references: [users.id],
  }),
}));
