import { useQuery } from "@tanstack/react-query";
import Header from "@/components/time-tracker/header";
import CurrentStatus from "@/components/time-tracker/current-status";
import TimeTrackingControls from "@/components/time-tracker/time-tracking-controls";
import PayrollPeriod from "@/components/time-tracker/payroll-period";
import RecentActivity from "@/components/time-tracker/recent-activity";

export default function TimeTracker() {
  const { data: user } = useQuery<any>({
    queryKey: ["/api/user/current"],
  });

  const { data: todayEntry } = useQuery<any>({
    queryKey: ["/api/time-entries/today"],
  });

  const { data: currentPayroll } = useQuery<any>({
    queryKey: ["/api/payroll/current"],
  });

  const { data: previousPayroll } = useQuery<any>({
    queryKey: ["/api/payroll/previous"],
  });

  const { data: recentActivity } = useQuery<any>({
    queryKey: ["/api/time-entries/recent"],
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header user={user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CurrentStatus todayEntry={todayEntry} />
        
        <TimeTrackingControls todayEntry={todayEntry} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PayrollPeriod 
            period={currentPayroll?.period}
            totalHours={currentPayroll?.totalHours}
            daysWorked={currentPayroll?.daysWorked}
            title="Current Payroll Period"
            status="Active"
            statusColor="green"
          />
          <PayrollPeriod 
            period={previousPayroll?.period}
            totalHours={previousPayroll?.totalHours}
            daysWorked={0}
            title="Previous Period"
            status={previousPayroll?.period?.status === "review" ? "Reserve Week" : "Closed"}
            statusColor="yellow"
          />
        </div>
        
        <RecentActivity entries={recentActivity} />
      </main>

      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <div>
              © 2024 TimeTracker Pro. Employee Time Management System.
            </div>
            <div className="flex space-x-4">
              <button className="hover:text-gray-700 dark:hover:text-gray-300">Help</button>
              <button className="hover:text-gray-700 dark:hover:text-gray-300">Support</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
