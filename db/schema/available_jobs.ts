import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const availableJobs = pgTable("available_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobTitle: text("job_title").notNull(),
  company: text("company").notNull(),
  location: text("location"),
  jobLink: text("job_link").unique().notNull(),
  postedDate: text("posted_date"),
  scrapedAt: timestamp("scraped_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type AvailableJob = typeof availableJobs.$inferSelect;
export type NewAvailableJob = typeof availableJobs.$inferInsert;
