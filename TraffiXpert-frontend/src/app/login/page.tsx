// File: TraffiXpert-frontend/src/app/login/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Base URL for your Spring Boot backend API
const API_BASE_URL = 'http://localhost:8080/api';

export default function LoginPage() {
  const [email, setEmail] = useState(""); // Use 'email' for consistency, though backend might use 'username'
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send username (using email field) and password
        // Adjust 'username' if your backend expects 'email'
        body: JSON.stringify({ username: email, password: password }),
      });

      if (!response.ok) {
        let errorMessage = "Login failed. Please check your credentials.";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) { /* Ignore if response is not JSON */ }
        throw new Error(errorMessage);
      }

      // --- Handle Successful Login ---
      const loginData = await response.json(); // Assuming backend might return data like a token

      // !!! IMPORTANT: Store authentication status !!!
      // Example: Store a dummy token in localStorage. Replace with actual token/session handling.
      // If your backend returns a JWT token in loginData.token:
      // localStorage.setItem('authToken', loginData.token);
      // For this example, we'll just set a simple flag:
      localStorage.setItem('authToken', 'dummy-token-replace-me'); // Replace 'authToken' and value accordingly

      console.log("Login successful!", loginData); // Log success and any data received

      // Redirect to the dashboard page upon successful login
      router.push('/'); // Use push to navigate normally

    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "An unexpected error occurred.");
      // Clear any potentially stored token on login failure
      localStorage.removeItem('authToken'); // Make sure invalid state is cleared
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the dashboard.
            <br />
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
            <CardContent className="grid gap-4">
             {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Login Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email">Username</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="User" // Default username for dev
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password" // Default password for dev
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </CardFooter>
        </form>
      </Card>
    </div>
  );
}