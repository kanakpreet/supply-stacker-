export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startStr = start.toLocaleDateString([], {
    month: 'short',
    day: 'numeric'
  });
  
  const endStr = end.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  return `${startStr} - ${endStr}`;
}

export function calculateRemainingDays(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  
  // Set time to end of day for end date
  end.setHours(23, 59, 59, 999);
  
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

export function getCurrentPayrollPeriod(): { startDate: string; endDate: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  let startDate, endDate;
  
  if (now.getDate() <= 15) {
    // First half of month (1st-15th)
    startDate = new Date(year, month, 1);
    endDate = new Date(year, month, 15);
  } else {
    // Second half of month (16th-end)
    startDate = new Date(year, month, 16);
    endDate = new Date(year, month + 1, 0); // Last day of current month
  }
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
}

export function isInReserveWeek(payrollEndDate: string): boolean {
  const endDate = new Date(payrollEndDate);
  const now = new Date();
  
  // Reserve week starts immediately after payroll period ends
  const reserveStart = new Date(endDate);
  reserveStart.setDate(reserveStart.getDate() + 1);
  
  const reserveEnd = new Date(reserveStart);
  reserveEnd.setDate(reserveEnd.getDate() + 6); // 7 days total
  
  return now >= reserveStart && now <= reserveEnd;
}
