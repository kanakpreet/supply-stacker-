import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  employeeId: text("employee_id").notNull().unique(),
});

export const timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  clockIn: timestamp("clock_in"),
  lunchOut: timestamp("lunch_out"),
  lunchIn: timestamp("lunch_in"),
  clockOut: timestamp("clock_out"),
  totalHours: text("total_hours"), // Stored as decimal string
  status: text("status").notNull().default("incomplete"), // incomplete, complete, flagged
  flags: text("flags").array().default([]), // Array of flag messages
  isLocked: boolean("is_locked").default(false), // Reserve week lockout
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const payrollPeriods = pgTable("payroll_periods", {
  id: serial("id").primaryKey(),
  startDate: text("start_date").notNull(), // YYYY-MM-DD format
  endDate: text("end_date").notNull(), // YYYY-MM-DD format
  status: text("status").notNull().default("active"), // active, review, closed
  reserveStartDate: text("reserve_start_date"), // Start of 7-day reserve period
  reserveEndDate: text("reserve_end_date"), // End of 7-day reserve period
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertTimeEntrySchema = createInsertSchema(timeEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const punchSchema = z.object({
  type: z.enum(["clockIn", "lunchOut", "lunchIn", "clockOut"]),
  timestamp: z.string().datetime(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;
export type PayrollPeriod = typeof payrollPeriods.$inferSelect;
export type PunchRequest = z.infer<typeof punchSchema>;
