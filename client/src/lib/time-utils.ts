import type { TimeEntry } from "@shared/schema";

export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function calculateWorkedHours(entry?: TimeEntry): string {
  if (!entry?.clockIn) return "0.0";
  
  const now = new Date();
  const clockIn = new Date(entry.clockIn);
  const clockOut = entry.clockOut ? new Date(entry.clockOut) : now;
  
  let totalMs = clockOut.getTime() - clockIn.getTime();
  
  // Subtract break time if applicable
  if (entry.lunchOut && entry.lunchIn) {
    const breakStart = new Date(entry.lunchOut);
    const breakEnd = new Date(entry.lunchIn);
    const breakMs = breakEnd.getTime() - breakStart.getTime();
    totalMs -= breakMs;
  } else if (entry.lunchOut && !entry.lunchIn) {
    // If on break, subtract from now
    const breakStart = new Date(entry.lunchOut);
    const breakMs = now.getTime() - breakStart.getTime();
    totalMs -= breakMs;
  }
  
  const hours = Math.max(0, totalMs / (1000 * 60 * 60));
  return hours.toFixed(1);
}

export function isWithinReserveWeek(date: string): boolean {
  // This would need to check against payroll periods
  // For now, return false as a placeholder
  return false;
}
