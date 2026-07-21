import { pgTable, uuid, text, timestamp, unique, integer } from "drizzle-orm/pg-core";
import { authUsers } from "./profiles";

export const llmKeys = pgTable("llm_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  modelName: text("model_name").notNull(),
  apiKey: text("api_key").notNull(),
  requestsToday: integer("requests_today").default(0).notNull(),
  tokensToday: integer("tokens_today").default(0).notNull(),
  resetAt: timestamp("reset_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (t) => [
  unique().on(t.userId, t.modelName)
]);

export type LlmKey = typeof llmKeys.$inferSelect;
export type NewLlmKey = typeof llmKeys.$inferInsert;
