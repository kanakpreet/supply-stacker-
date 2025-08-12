import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import type { PayrollPeriod } from "@shared/schema";
import { formatDateRange, calculateRemainingDays } from "@/lib/payroll-utils";

interface PayrollPeriodProps {
  period?: PayrollPeriod;
  totalHours?: string;
  daysWorked?: number;
  title: string;
  status: string;
  statusColor: "green" | "yellow" | "red";
}

export default function PayrollPeriodComponent({ 
  period, 
  totalHours, 
  daysWorked, 
  title, 
  status, 
  statusColor 
}: PayrollPeriodProps) {
  const badgeColor = {
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    red: "bg-red-100 text-red-800",
  }[statusColor];

  const isReserveWeek = status === "Reserve Week";
  const remainingDays = period ? calculateRemainingDays(period.endDate) : 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        <Badge className={`px-2 py-1 text-xs font-medium rounded-full ${badgeColor}`}>
          {status}
        </Badge>
      </div>
      
      {period ? (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-300">Period:</span>
            <span className="text-sm font-medium dark:text-gray-200">
              {formatDateRange(period.startDate, period.endDate)}
            </span>
          </div>
          
          {daysWorked !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">Days Worked:</span>
              <span className="text-sm font-medium dark:text-gray-200">{daysWorked}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-300">Total Hours:</span>
            <span className="text-sm font-medium text-primary">
              {totalHours || "0"} hrs
            </span>
          </div>
          
          {remainingDays >= 0 && title.includes("Current") && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">Days Remaining:</span>
              <span className="text-sm font-medium dark:text-gray-200">{remainingDays} days</span>
            </div>
          )}
          
          {!title.includes("Current") && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">Status:</span>
              <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                {isReserveWeek ? "Under Review" : "Completed"}
              </span>
            </div>
          )}
          
          {isReserveWeek && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded flex items-center">
              <Lock className="mr-1" size={12} />
              Edits locked during employer review period
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          No payroll period data available
        </div>
      )}
    </Card>
  );
}
