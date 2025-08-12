import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, AlertTriangle, Clock } from "lucide-react";
import type { TimeEntry } from "@shared/schema";
import { formatTime, formatDate } from "@/lib/time-utils";

interface RecentActivityProps {
  entries?: TimeEntry[];
}

export default function RecentActivity({ entries }: RecentActivityProps) {
  const getStatusBadge = (entry: TimeEntry) => {
    if (entry.flags && entry.flags.length > 0) {
      return (
        <Badge className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertTriangle className="mr-1" size={8} />
          Flagged
        </Badge>
      );
    }
    
    if (entry.status === "complete") {
      return (
        <Badge className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Check className="mr-1" size={8} />
          Complete
        </Badge>
      );
    }
    
    return (
      <Badge className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <Clock className="mr-1" size={8} />
        Active
      </Badge>
    );
  };

  const formatTimeOrMissing = (timestamp: Date | null) => {
    if (!timestamp) return <span className="text-error">Missing</span>;
    return formatTime(new Date(timestamp));
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Clock In
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Start Break
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                End Break
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Clock Out
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {entries && entries.length > 0 ? (
              entries.map((entry) => (
                <tr 
                  key={entry.id} 
                  className={entry.flags && entry.flags.length > 0 ? "bg-red-50 dark:bg-red-900/20" : ""}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(entry.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {entry.clockIn ? formatTime(new Date(entry.clockIn)) : "--"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {entry.lunchOut ? formatTime(new Date(entry.lunchOut)) : "--"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {entry.lunchIn ? formatTime(new Date(entry.lunchIn)) : "--"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {entry.clockOut ? formatTime(new Date(entry.clockOut)) : 
                     (entry.flags && entry.flags.some(f => f.includes("clock out"))) ? 
                     formatTimeOrMissing(null) : "--"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {entry.totalHours !== "0" ? `${entry.totalHours} hrs` : "--"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(entry)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  No recent activity found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <Button variant="link" className="text-sm text-primary hover:text-blue-600 p-0">
          View All Activity
        </Button>
        <span className="text-xs text-gray-500 dark:text-gray-400">Last updated: Just now</span>
      </div>
    </Card>
  );
}
