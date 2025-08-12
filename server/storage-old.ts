import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { users, timeEntries, payrollPeriods, type User, type InsertUser, type TimeEntry, type InsertTimeEntry, type PayrollPeriod } from "@shared/schema";
// Storage interface definition
interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getTimeEntry(userId: number, date: string): Promise<TimeEntry | undefined>;
  createTimeEntry(entry: InsertTimeEntry): Promise<TimeEntry>;
  updateTimeEntry(id: number, entry: Partial<TimeEntry>): Promise<TimeEntry | undefined>;
  getTimeEntriesForUser(userId: number, startDate?: string, endDate?: string): Promise<TimeEntry[]>;
  getTimeEntriesForPayrollPeriod(userId: number, startDate: string, endDate: string): Promise<TimeEntry[]>;
  getCurrentPayrollPeriod(): Promise<PayrollPeriod | undefined>;
  getPreviousPayrollPeriod(): Promise<PayrollPeriod | undefined>;
  createPayrollPeriod(period: Omit<PayrollPeriod, 'id'>): Promise<PayrollPeriod>;
  updatePayrollPeriod(id: number, period: Partial<PayrollPeriod>): Promise<PayrollPeriod | undefined>;
}

import { mockStorage } from './mock-storage';

let pool: any;
let db: any;
let useDatabase = true;

try {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool);
  console.log('🔗 Attempting to connect to PostgreSQL database...');
} catch (error) {
  console.warn('⚠️  Database connection failed, using mock storage');
  useDatabase = false;
}

class PgStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    try {
      if (!useDatabase) return mockStorage.getUser(id);
      const result = await db.select().from(users).where(eq(users.id, id));
      return result[0];
    } catch (error) {
      console.warn('Database error, falling back to mock storage:', error.message);
      return mockStorage.getUser(id);
    }
  }
  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      if (!useDatabase) return mockStorage.getUserByUsername(username);
      const result = await db.select().from(users).where(eq(users.username, username));
      return result[0];
    } catch (error) {
      console.warn('Database error, falling back to mock storage:', error.message);
      return mockStorage.getUserByUsername(username);
    }
  }
  async createUser(user: InsertUser): Promise<User> {
    try {
      if (!useDatabase) return mockStorage.createUser(user);
      const result = await db.insert(users).values(user).returning();
      return result[0];
    } catch (error) {
      console.warn('Database error, falling back to mock storage:', error.message);
      return mockStorage.createUser(user);
    }
  }
  async getTimeEntry(userId: number, date: string): Promise<TimeEntry | undefined> {
    const result = await db.select().from(timeEntries).where(and(eq(timeEntries.userId, userId), eq(timeEntries.date, date)));
    return result[0];
  }
  async createTimeEntry(entry: InsertTimeEntry): Promise<TimeEntry> {
    const result = await db.insert(timeEntries).values(entry).returning();
    return result[0];
  }
  async updateTimeEntry(id: number, entry: Partial<TimeEntry>): Promise<TimeEntry | undefined> {
    const result = await db.update(timeEntries).set(entry).where(eq(timeEntries.id, id)).returning();
    return result[0];
  }
  async getTimeEntriesForUser(userId: number, startDate?: string, endDate?: string): Promise<TimeEntry[]> {
    if (startDate && endDate) {
      const result = await db.select().from(timeEntries)
        .where(and(
          eq(timeEntries.userId, userId),
          gte(timeEntries.date, startDate),
          lte(timeEntries.date, endDate)
        ))
        .orderBy(desc(timeEntries.date));
      return result;
    } else {
      const result = await db.select().from(timeEntries)
        .where(eq(timeEntries.userId, userId))
        .orderBy(desc(timeEntries.date));
      return result;
    }
  }
  async getTimeEntriesForPayrollPeriod(userId: number, startDate: string, endDate: string): Promise<TimeEntry[]> {
    return this.getTimeEntriesForUser(userId, startDate, endDate);
  }
  async getCurrentPayrollPeriod(): Promise<PayrollPeriod | undefined> {
    const result = await db.select().from(payrollPeriods).where(eq(payrollPeriods.status, 'active'));
    return result[0];
  }
  async getPreviousPayrollPeriod(): Promise<PayrollPeriod | undefined> {
    const result = await db.select().from(payrollPeriods).where(eq(payrollPeriods.status, 'review'));
    return result[0];
  }
  async createPayrollPeriod(period: Omit<PayrollPeriod, 'id'>): Promise<PayrollPeriod> {
    const result = await db.insert(payrollPeriods).values(period).returning();
    return result[0];
  }
  async updatePayrollPeriod(id: number, period: Partial<PayrollPeriod>): Promise<PayrollPeriod | undefined> {
    const result = await db.update(payrollPeriods).set(period).where(eq(payrollPeriods.id, id)).returning();
    return result[0];
  }
}

// For now, use mock storage due to database connection issues
export const storage = mockStorage;
