import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      return apiRequest("POST", "/api/auth/login", credentials);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      window.location.href = "/";
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: { username: string; password: string; name: string; employeeId: string }) => {
      return apiRequest("POST", "/api/auth/register", userData);
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "You can now log in with your credentials",
      });
      setIsRegister(false);
      setName("");
      setEmployeeId("");
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRegister) {
      if (!name || !employeeId) {
        toast({
          title: "Missing Information",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return;
      }
      registerMutation.mutate({ username, password, name, employeeId });
    } else {
      loginMutation.mutate({ username, password });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Clock className="text-primary text-3xl mr-2" />
            <h1 className="text-2xl font-bold dark:text-white">TimeTracker Pro</h1>
          </div>
          <CardTitle>{isRegister ? "Create Account" : "Sign In"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="Employee ID"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
            <div>
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending || registerMutation.isPending}
            >
              {isRegister ? "Create Account" : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-blue-600 hover:underline"
            >
              {isRegister ? "Already have an account? Sign in" : "Need an account? Register"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}