// File: TraffiXpert-frontend/src/app/(main)/layout.tsx
"use client"; // Required for using hooks like useRouter, useEffect, useState

import { AppShell } from '@/components/layout/app-shell';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton"; // Optional: For a loading UI

/**
 * Checks if the user is authenticated.
 * !!! IMPORTANT: Replace this placeholder with your actual authentication check logic.
 * This example checks for an item named 'authToken' in localStorage.
 * Adjust this based on how you store login status (e.g., session cookie, context).
 * @returns {boolean} True if authenticated, false otherwise.
 */
const checkAuthStatus = (): boolean => {
  // Check only on the client-side
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken'); // Use your specific storage key
    // You might add more checks here (e.g., token validation/expiry)
    return !!token; // Returns true if a token exists, false otherwise
  }
  return false; // Not authenticated during SSR or if window is unavailable
};

// --- Loading Component (Optional) ---
// You can create a more sophisticated loading skeleton if desired
const LoadingLayout = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <Skeleton className="h-12 w-12 rounded-full" />
    <Skeleton className="h-4 w-[250px] ml-4" />
  </div>
);
// --- End Loading Component ---


export default function MainAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  // State to track authentication status: null = checking, false = not auth, true = auth
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const authenticated = checkAuthStatus();
    setIsAuthenticated(authenticated);

    if (!authenticated) {
      // If not authenticated, redirect to the login page
      router.replace('/login'); // Use replace to avoid adding the protected page to history
    }
    // No dependencies needed if checkAuthStatus doesn't rely on props/state
    // If checkAuthStatus relies on context, add context value to dependencies
  }, [router]); // Re-run if router changes (though unlikely)

  // While checking authentication, show a loading state
  if (isAuthenticated === null) {
    return <LoadingLayout />; // Or return null if you prefer a blank screen
  }

  // If authenticated, render the main application shell and the page content
  // If not authenticated, this return won't be reached due to the redirect in useEffect,
  // but returning null ensures nothing renders momentarily before redirection.
  return isAuthenticated ? (
    <AppShell>
      {children}
    </AppShell>
  ) : null;
}