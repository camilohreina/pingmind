import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

export const logMessages = pgTable("logMessages", {
  id: varchar("id", { length: 255 }).primaryKey(),
  messageId: varchar("message_id", { length: 255 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
});
