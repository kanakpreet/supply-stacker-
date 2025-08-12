import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { users, timeEntries, payrollPeriods, type User, type InsertUser, type TimeEntry, type InsertTimeEntry, type PayrollPeriod } from "@shared/schema";
import { mockStorage } from './mock-storage';

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

let pool: any;
let db: any;
let useDatabase = false;
let dbInitialized = false;

// Database initialization function
async function initializeDatabase() {
  if (dbInitialized) return useDatabase;
  
  try {
    console.log('🔗 Attempting to connect to PostgreSQL database...');
    
    // Try different import methods for better compatibility
    let drizzle, Pool;
    
    try {
      // Method 1: Standard ESM import
      const drizzleModule = await import('drizzle-orm/node-postgres');
      drizzle = drizzleModule.drizzle;
      
      const pgModule = await import('pg');
      Pool = pgModule.default?.Pool || pgModule.Pool;
    } catch (importError) {
      console.log('ESM import failed, trying alternative method...');
      
      // Method 2: Dynamic require (fallback)
      const drizzleModule = require('drizzle-orm/node-postgres');
      drizzle = drizzleModule.drizzle;
      
      const pgModule = require('pg');
      Pool = pgModule.Pool;
    }
    
    if (!Pool || !drizzle) {
      throw new Error('Failed to import required database modules');
    }
    
    // Create connection
    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: false
    });
    
    db = drizzle(pool);
    
    // Test the connection
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    
    useDatabase = true;
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.warn('⚠️  Database connection failed, using mock storage:', error.message);
    useDatabase = false;
  }
  
  dbInitialized = true;
  return useDatabase;
}

class PgStorage implements IStorage {
  async ensureInitialized() {
    if (!dbInitialized) {
      await initializeDatabase();
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    await this.ensureInitialized();
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
    await this.ensureInitialized();
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
    await this.ensureInitialized();
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
    await this.ensureInitialized();
    try {
      if (!useDatabase) return mockStorage.getTimeEntry(userId, date);
      const result = await db.select().from(timeEntries).where(and(eq(timeEntries.userId, userId), eq(timeEntries.date, date)));
      return result[0];
    } catch (error) {
      console.warn('Database error, falling back to mock storage:', error.message);
      return mockStorage.getTimeEntry(userId, date);
    }
  }

  async createTimeEntry(entry: InsertTimeEntry): Promise<TimeEntry> {
    await this.ensureInitialized();
    try {
      if (!useDatabase) return mockStorage.createTimeEntry(entry);
      const result = await db.insert(timeEntries).values(entry).returning();
      return result[0];
    } catch (error) {
      console.warn('Database error, falling back to mock storage:', error.message);
      return mockStorage.createTimeEntry(entry);
    }
  }

  async updateTimeEntry(id: number, entry: Partial<TimeEntry>): Promise<TimeEntry | undefined> {
    await this.ensureInitialized();
    try {
      if (!useDatabase) return mockStorage.updateTimeEntry(id, entry);
      const result = await db.update(timeEntries).set(entry).where(eq(timeEntries.id, id)).returning();
      return result[0];
    } catch (error) {
      console.warn('Database error, falling back to mock storage:', error.message);
      return mockStorage.updateTimeEntry(id, entry);
    }
  }

  async getTimeEntriesForUser(userId: number, startDate?: string, endDate?: string): Promise<TimeEntry[]> {
    await this.ensureInitialized();
    try {
      if (!useDatabase) return mockStorage.getTimeEntriesForUser(userId, startDate, endDate);
      
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
    } catch (error) {
      console.warn('Database error, falling back to mock storage:', error.message);
      return mockStorage.getTimeEntriesForUser(userId, startDate, endDate);
    }
  }

  async getTimeEntriesForPayrollPeriod(userId: number, startDate: string, endDate: string): Promise<TimeEntry[]> {
    return this.getTimeEntriesForUser(userId, startDate, endDate);
  }

  async getCurrentPayrollPeriod(): Promise<PayrollPeriod | undefined> {
    await this.ensureInitialized();
    try {
      if (!useDatabase) return mockStorage.getCurrentPayrollPeriod();
      const result = await db.select().from(payrollPeriods).where(eq(payrollPeriods.status, 'active'));
      return result[0];
    } catch (error) {
      console.warn('Database error, falling back to mock storage:', error.message);
      return mockStorage.getCurrentPayrollPeriod();
    }
  }

  async getPreviousPayrollPeriod(): Promise<PayrollPeriod | undefined> {
    await this.ensureInitialized();
    try {
      if (!useDatabase) return mockStorage.getPreviousPayrollPeriod();
      const result = await db.select().from(payrollPeriods).where(eq(payrollPeriods.status, 'review'));
      return result[0];
    } catch (error) {
      console.warn('Database error, falling back to mock storage:', error.message);
      return mockStorage.getPreviousPayrollPeriod();
    }
  }

  async createPayrollPeriod(period: Omit<PayrollPeriod, 'id'>): Promise<PayrollPeriod> {
    await this.ensureInitialized();
    try {
      if (!useDatabase) return mockStorage.createPayrollPeriod(period);
      const result = await db.insert(payrollPeriods).values(period).returning();
      return result[0];
    } catch (error) {
      console.warn('Database error, falling back to mock storage:', error.message);
      return mockStorage.createPayrollPeriod(period);
    }
  }

  async updatePayrollPeriod(id: number, period: Partial<PayrollPeriod>): Promise<PayrollPeriod | undefined> {
    await this.ensureInitialized();
    try {
      if (!useDatabase) return mockStorage.updatePayrollPeriod(id, period);
      const result = await db.update(payrollPeriods).set(period).where(eq(payrollPeriods.id, id)).returning();
      return result[0];
    } catch (error) {
      console.warn('Database error, falling back to mock storage:', error.message);
      return mockStorage.updatePayrollPeriod(id, period);
    }
  }
}

// For now, always use mock storage to avoid import issues
export const storage = mockStorage;

// Uncomment this line when database issues are resolved:
// export const storage = new PgStorage();