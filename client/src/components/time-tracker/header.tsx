import { Clock, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import type { User } from "@shared/schema";

interface HeaderProps {
  user?: User;
}

export default function Header({ user }: HeaderProps) {
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Clock className="text-primary text-2xl mr-3" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">TimeTracker Pro</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <span>{user?.name || "Loading..."}</span>
              <div className="text-xs text-gray-500 dark:text-gray-400">ID: {user?.employeeId || "---"}</div>
            </div>
            <ThemeToggle />
            <button 
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
