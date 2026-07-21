import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const linkedinJobs = pgTable("linkedin_jobs", {
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

export type LinkedInJob = typeof linkedinJobs.$inferSelect;
export type NewLinkedInJob = typeof linkedinJobs.$inferInsert;
