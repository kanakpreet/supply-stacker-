import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import type { TimeEntry } from "@shared/schema";
import { formatTime, calculateWorkedHours } from "@/lib/time-utils";

interface CurrentStatusProps {
  todayEntry?: TimeEntry;
}

export default function CurrentStatus({ todayEntry }: CurrentStatusProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const getStatus = () => {
    if (!todayEntry?.clockIn) return { text: "Not Clocked In", color: "bg-gray-500" };
    if (todayEntry.clockOut) return { text: "Clocked Out", color: "bg-gray-500" };
    if (todayEntry.lunchOut && !todayEntry.lunchIn) return { text: "On Break", color: "bg-warning" };
    return { text: "Clocked In", color: "bg-success" };
  };

  const status = getStatus();
  const workedHours = calculateWorkedHours(todayEntry);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Current Status Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Current Status</h2>
          <div className="flex items-center">
            <div className={`w-3 h-3 ${status.color} rounded-full mr-2`}></div>
            <span className="text-sm font-medium dark:text-gray-200">{status.text}</span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-300">Clock In Time:</span>
            <span className="text-sm font-medium dark:text-gray-200">
              {todayEntry?.clockIn ? formatTime(new Date(todayEntry.clockIn)) : "--"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-300">Hours Today:</span>
            <span className="text-sm font-medium dark:text-gray-200">{workedHours} hrs</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-300">Current Time:</span>
            <span className="text-sm font-medium text-primary">
              {formatTime(currentTime)}
            </span>
          </div>
        </div>
      </Card>

      {/* Today's Summary Card */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today's Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-300">Regular Hours:</span>
            <span className="text-sm font-medium dark:text-gray-200">{todayEntry?.totalHours || "0"} hrs</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-300">Break Time:</span>
            <span className="text-sm font-medium dark:text-gray-200">
              {todayEntry?.lunchOut && todayEntry?.lunchIn ? "1.0 hr" : "--"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-300">Total Worked:</span>
            <span className="text-sm font-medium text-primary">{workedHours} hrs</span>
          </div>
        </div>
      </Card>

      {/* Flags & Alerts Card */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Alerts</h2>
        <div className="space-y-3">
          {todayEntry?.flags && todayEntry.flags.length > 0 ? (
            todayEntry.flags.map((flag, index) => (
              <Alert key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <AlertDescription className="text-sm">
                  <div className="font-medium text-yellow-600 dark:text-yellow-400">Alert</div>
                  <div className="text-xs text-yellow-700 dark:text-yellow-300">{flag}</div>
                </AlertDescription>
              </Alert>
            ))
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
              No alerts or flags
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
