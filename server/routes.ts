import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { punchSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import passport from "./auth";

// Authentication middleware
function requireAuth(req: Request, res: Response, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
}

function calculateHours(clockIn: Date | null, clockOut: Date | null, lunchOut: Date | null, lunchIn: Date | null): string {
  if (!clockIn || !clockOut) return "0";
  
  const totalMs = clockOut.getTime() - clockIn.getTime();
  let breakMs = 0;
  
  if (lunchOut && lunchIn) {
    breakMs = lunchIn.getTime() - lunchOut.getTime();
  }
  
  const workedMs = totalMs - breakMs;
  const hours = workedMs / (1000 * 60 * 60);
  return Math.max(0, hours).toFixed(1);
}

function validatePunchSequence(entry: any, punchType: string): string[] {
  const flags: string[] = [];
  
  switch (punchType) {
    case "clockIn":
      if (entry.clockIn) flags.push("Already clocked in");
      break;
    case "lunchOut":
      if (!entry.clockIn) flags.push("Must clock in before starting break");
      if (entry.lunchOut) flags.push("Already on break");
      break;
    case "lunchIn":
      if (!entry.lunchOut) flags.push("Must start break first");
      if (entry.lunchIn) flags.push("Already returned from break");
      break;
    case "clockOut":
      if (!entry.clockIn) flags.push("Must clock in first");
      if (entry.lunchOut && !entry.lunchIn) flags.push("Must end break before clocking out");
      if (entry.clockOut) flags.push("Already clocked out");
      break;
  }
  
  return flags;
}

function detectMissingPunches(entry: any): string[] {
  const flags: string[] = [];
  const now = new Date();
  const entryDate = new Date(entry.date);
  const isToday = entryDate.toDateString() === now.toDateString();
  
  // Only flag missing punches for past days or if it's end of current day
  if (!isToday || now.getHours() >= 18) {
    if (entry.clockIn && !entry.clockOut) {
      flags.push("Missing clock out time");
    }
    if (entry.lunchOut && !entry.lunchIn) {
      flags.push("Missing break end time");
    }
  }
  
  return flags;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", passport.authenticate('local'), (req, res) => {
    res.json({ user: req.user, message: "Login successful" });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser(userData);
      res.status(201).json({ user: { ...user, password: undefined } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data" });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Get current user
  app.get("/api/user/current", requireAuth, async (req, res) => {
    res.json(req.user);
  });

  // Get current time entry for today
  app.get("/api/time-entries/today", requireAuth, async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const userId = (req.user as any).id;
      let entry = await storage.getTimeEntry(userId, today);
      
      if (!entry) {
        entry = await storage.createTimeEntry({
          userId: 1,
          date: today,
          clockIn: null,
          lunchOut: null,
          lunchIn: null,
          clockOut: null,
          totalHours: "0",
          status: "incomplete",
          flags: [],
          isLocked: false,
        });
      }
      
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to get time entry" });
    }
  });

  // Record a punch
  app.post("/api/time-entries/punch", requireAuth, async (req, res) => {
    try {
      const validatedData = punchSchema.parse(req.body);
      const { type, timestamp } = validatedData;
      
      const today = new Date().toISOString().split('T')[0];
      const userId = (req.user as any).id;
      let entry = await storage.getTimeEntry(userId, today);
      
      if (!entry) {
        entry = await storage.createTimeEntry({
          userId,
          date: today,
          clockIn: null,
          lunchOut: null,
          lunchIn: null,
          clockOut: null,
          totalHours: "0",
          status: "incomplete",
          flags: [],
          isLocked: false,
        });
      }

      // Check if entry is locked (reserve week)
      if (entry.isLocked) {
        return res.status(400).json({ message: "Time entry is locked during reserve period" });
      }

      // Validate sequence
      const sequenceFlags = validatePunchSequence(entry, type);
      if (sequenceFlags.length > 0) {
        return res.status(400).json({ message: sequenceFlags[0] });
      }

      // Update the entry with the new punch
      const punchTime = new Date(timestamp);
      const updates: any = {};
      
      switch (type) {
        case "clockIn":
          updates.clockIn = punchTime;
          break;
        case "lunchOut":
          updates.lunchOut = punchTime;
          break;
        case "lunchIn":
          updates.lunchIn = punchTime;
          break;
        case "clockOut":
          updates.clockOut = punchTime;
          break;
      }

      // Calculate total hours if we have clock in and out
      if (type === "clockOut" || entry.clockOut) {
        const clockIn = updates.clockIn || entry.clockIn;
        const clockOut = updates.clockOut || entry.clockOut;
        const lunchOut = updates.lunchOut || entry.lunchOut;
        const lunchIn = updates.lunchIn || entry.lunchIn;
        
        updates.totalHours = calculateHours(clockIn, clockOut, lunchOut, lunchIn);
      }

      // Check for missing punches and update status
      const updatedEntry = { ...entry, ...updates };
      const missingPunches = detectMissingPunches(updatedEntry);
      
      updates.flags = missingPunches;
      updates.status = missingPunches.length > 0 ? "flagged" : 
                     (updatedEntry.clockIn && updatedEntry.clockOut) ? "complete" : "incomplete";

      const result = await storage.updateTimeEntry(entry.id, updates);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid punch data" });
      }
      res.status(500).json({ message: "Failed to record punch" });
    }
  });

  // Get recent activity
  app.get("/api/time-entries/recent", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const entries = await storage.getTimeEntriesForUser(userId);
      const recent = entries.slice(0, 10); // Last 10 entries
      res.json(recent);
    } catch (error) {
      res.status(500).json({ message: "Failed to get recent activity" });
    }
  });

  // Get current payroll period
  app.get("/api/payroll/current", requireAuth, async (req, res) => {
    try {
      const period = await storage.getCurrentPayrollPeriod();
      if (!period) {
        return res.status(404).json({ message: "No active payroll period" });
      }

      const userId = (req.user as any).id;
      const entries = await storage.getTimeEntriesForPayrollPeriod(userId, period.startDate, period.endDate);
      const totalHours = entries.reduce((sum, entry) => sum + parseFloat(entry.totalHours || "0"), 0);
      const daysWorked = entries.filter(entry => entry.status === "complete").length;

      res.json({
        period,
        entries,
        totalHours: totalHours.toFixed(1),
        daysWorked,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get payroll period" });
    }
  });

  // Get previous payroll period
  app.get("/api/payroll/previous", requireAuth, async (req, res) => {
    try {
      const period = await storage.getPreviousPayrollPeriod();
      if (!period) {
        return res.json(null);
      }

      const userId = (req.user as any).id;
      const entries = await storage.getTimeEntriesForPayrollPeriod(userId, period.startDate, period.endDate);
      const totalHours = entries.reduce((sum, entry) => sum + parseFloat(entry.totalHours || "0"), 0);

      res.json({
        period,
        entries,
        totalHours: totalHours.toFixed(1),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get previous payroll period" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
