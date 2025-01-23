import {neon, neonConfig} from "@neondatabase/serverless";
import {drizzle} from "drizzle-orm/neon-http";
import { accounts, sessions, users, verificationTokens } from "./schema/users";
import { reminderRelations, reminders } from "./schema/reminders";

// neonConfig.fetchConnectionCache = true;

const sql = neon(process.env.DATABASE_URL!);

// export const db = drizzle(sql);
export const db = drizzle(sql, {logger: true,
    schema:{
        users,
        reminders,
        accounts,
        sessions,
        verificationTokens,
        reminderRelations
    }
});
export * from './schema/users'
export * from './schema/reminders'

export * from "drizzle-orm";
