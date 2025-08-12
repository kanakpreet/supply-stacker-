import { useState } from "react";

interface Toast {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (toast: Toast) => {
    setToasts(prev => [...prev, toast]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.slice(1));
    }, 5000);
  };

  return { toast, toasts };
}