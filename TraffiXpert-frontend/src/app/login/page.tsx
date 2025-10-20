"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter, // Added CardFooter
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react"; // Added useState
import { Loader2 } from "lucide-react"; // Added Loader2
import { useRouter } from "next/navigation"; // Added useRouter for redirection
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Added Alert components
import { AlertCircle } from "lucide-react"; // Added AlertCircle icon

// Base URL for your Spring Boot backend API
const API_BASE_URL = 'http://localhost:8080/api';

export default function LoginPage() {
  const [email, setEmail] = useState(""); // Use 'email' for consistency, though backend might use 'username'
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Create POST /api/auth/login endpoint in Spring Boot backend
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
        // Try to parse error message from backend if available
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) { /* Ignore if response is not JSON */ }

        throw new Error(errorMessage);
      }

      // --- Handle Successful Login ---
      // The backend might return a token (JWT) or set a session cookie.
      // For now, let's assume success means we can redirect.
      // We might need to store token/session info here later.
      console.log("Login successful!"); // Placeholder

      // Redirect to the dashboard page upon successful login
      router.push('/');

    } catch (err: any) { // Catch specific error type
      console.error("Login error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the dashboard.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}> {/* Use form element with onSubmit */}
            <CardContent className="grid gap-4">
             {error && ( // Display error message if login failed
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Login Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email">Username</Label> {/* Label changed to Username */}
                <Input
                  id="email"
                  type="text" // Changed from email to text
                  placeholder="User" // Default username for dev
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
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
                />
              </div>
            </CardContent>
            <CardFooter> {/* Use CardFooter for the button */}
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
