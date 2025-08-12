import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  LogIn, 
  LogOut, 
  Coffee, 
  Utensils, 
  ArrowRight 
} from "lucide-react";
import type { TimeEntry } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface TimeTrackingControlsProps {
  todayEntry?: TimeEntry;
}

export default function TimeTrackingControls({ todayEntry }: TimeTrackingControlsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const punchMutation = useMutation({
    mutationFn: async ({ type }: { type: string }) => {
      const timestamp = new Date().toISOString();
      return apiRequest("POST", "/api/time-entries/punch", { type, timestamp });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payroll/current"] });
      toast({
        title: "Success",
        description: "Time recorded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record time",
        variant: "destructive",
      });
    },
  });

  const handlePunch = (type: string) => {
    if (todayEntry?.isLocked) {
      toast({
        title: "Entry Locked",
        description: "This time entry is locked during the reserve period",
        variant: "destructive",
      });
      return;
    }
    
    punchMutation.mutate({ type });
  };

  // Make all buttons available, let backend handle sequence validation
  const canClockIn = !todayEntry?.clockIn;
  const canLunchOut = !todayEntry?.lunchOut;
  const canLunchIn = !todayEntry?.lunchIn;
  const canClockOut = !todayEntry?.clockOut;

  const getSequenceSteps = () => {
    return [
      { label: "Clock In", completed: !!todayEntry?.clockIn, active: !todayEntry?.clockIn },
      { label: "Start Break", completed: !!todayEntry?.lunchOut, active: !!todayEntry?.clockIn && !todayEntry?.lunchOut },
      { label: "End Break", completed: !!todayEntry?.lunchIn, active: !!todayEntry?.lunchOut && !todayEntry?.lunchIn },
      { label: "Clock Out", completed: !!todayEntry?.clockOut, active: canClockOut },
    ];
  };

  return (
    <Card className="p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Time Tracking</h2>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Button
          onClick={() => handlePunch("clockIn")}
          disabled={!canClockIn || punchMutation.isPending}
          className="flex flex-col items-center justify-center p-6 h-auto !bg-blue-500 hover:!bg-blue-600 disabled:!bg-gray-300 !text-white"
        >
          <LogIn className="text-2xl mb-2" />
          <span className="font-medium">Clock In</span>
          <span className="text-xs opacity-75 mt-1">
            {!canClockIn ? "Already clocked in" : "Start your day"}
          </span>
        </Button>

        <Button
          onClick={() => handlePunch("lunchOut")}
          disabled={!canLunchOut || punchMutation.isPending}
          className="flex flex-col items-center justify-center p-6 h-auto !bg-yellow-500 hover:!bg-yellow-600 disabled:!bg-gray-300 !text-white"
        >
          <Utensils className="text-2xl mb-2" />
          <span className="font-medium">Start Break</span>
          <span className="text-xs opacity-75 mt-1">Begin break period</span>
        </Button>

        <Button
          onClick={() => handlePunch("lunchIn")}
          disabled={!canLunchIn || punchMutation.isPending}
          className="flex flex-col items-center justify-center p-6 h-auto !bg-orange-500 hover:!bg-orange-600 disabled:!bg-gray-300 !text-white"
        >
          <Coffee className="text-2xl mb-2" />
          <span className="font-medium">End Break</span>
          <span className="text-xs opacity-75 mt-1">Resume work</span>
        </Button>

        <Button
          onClick={() => handlePunch("clockOut")}
          disabled={!canClockOut || punchMutation.isPending}
          className="flex flex-col items-center justify-center p-6 h-auto !bg-red-500 hover:!bg-red-600 disabled:!bg-gray-300 !text-white"
        >
          <LogOut className="text-2xl mb-2" />
          <span className="font-medium">Clock Out</span>
          <span className="text-xs opacity-75 mt-1">End work day</span>
        </Button>
      </div>

      {/* Sequence Indicator */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-300">Punch Sequence:</span>
          <div className="flex items-center space-x-2">
            {getSequenceSteps().map((step, index) => (
              <div key={step.label} className="flex items-center">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-1 ${
                    step.completed ? 'bg-green-500' : 
                    step.active ? 'bg-yellow-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}></div>
                  <span className={`font-medium ${
                    step.completed ? 'text-green-600 dark:text-green-400' : 
                    step.active ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < getSequenceSteps().length - 1 && (
                  <ArrowRight className="text-gray-400 dark:text-gray-500 ml-2" size={16} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
