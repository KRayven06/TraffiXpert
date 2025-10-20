"use client"; // Correct directive

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Clock, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// --- Define Type for Stats (matches backend DTO/Record) ---
interface StatsDTO {
    totalVehicles: number;
    avgWaitTime: number;
    vehiclesByDirection: { NORTH: number, SOUTH: number, EAST: number, WEST: number };
    avgEmergencyResponse: number; // In seconds
    lastEmergencyClearance: number | null; // In seconds
}
// --- End Type Definition ---

// Base URL for your Spring Boot backend API
const API_BASE_URL = 'http://localhost:8080/api';


export function EmergencyControls() {
  // State for fetched stats data
  const [stats, setStats] = useState<StatsDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch stats periodically
  useEffect(() => {
    const fetchData = async () => {
      // Only set loading true on the very first fetch attempt
      // Subsequent fetches update data without resetting to loading skeleton
      if (isLoading && !stats && !error) {
         // Keep setIsLoading(true) initial state
      } else {
         // For subsequent fetches, don't show skeleton, just update data
         // We might want a different indicator for background refresh if needed
      }

      try {
        const response = await fetch(`${API_BASE_URL}/stats`);
        if (!response.ok) {
           throw new Error(`Failed to fetch stats: ${response.status}`);
        }
        const data: StatsDTO = await response.json();
        setStats(data);
        setError(null); // Clear error on success
      } catch (err: any) { // Catch specific error type
        console.error("Error fetching emergency stats:", err);
        // Keep previous stats if available, otherwise clear
        if (!stats) setStats(null);
        setError(err.message || "Could not load stats.");
      } finally {
        // Set loading to false only after the first attempt completes
        if (isLoading) setIsLoading(false);
      }
    };

    fetchData(); // Initial fetch
    // Fetch stats less frequently, e.g., every 5 seconds
    const intervalId = setInterval(fetchData, 5000); // 5000ms = 5 seconds

    return () => clearInterval(intervalId); // Cleanup
  }, []); // Changed dependency array to empty [] - runs once on mount + cleanup


  // Helper function to format seconds
  const formatTime = (seconds: number | null | undefined): string => {
      if (seconds === null || seconds === undefined || isNaN(seconds)) {
          return "N/A";
      }
      return `${seconds.toFixed(1)}s`;
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg">Emergency Response Metrics</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {/* Average Response Time */}
        <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/40">
          <Clock className="h-6 w-6 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Avg. Response Time</p>
            {isLoading ? (
              <Skeleton className="h-6 w-16 mt-1" />
            ) : error && !stats ? ( // Show error only if no previous stats available
              <p className="text-lg font-bold text-destructive">Error</p>
            ) : (
              <p className="text-lg font-bold">{formatTime(stats?.avgEmergencyResponse)}</p>
            )}
          </div>
        </div>
        {/* Last Clearance Time */}
        <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/40">
          <Zap className="h-6 w-6 text-yellow-500" />
          <div>
            <p className="text-sm text-muted-foreground">Last Clearance Time</p>
             {isLoading ? (
              <Skeleton className="h-6 w-16 mt-1" />
            ) : error && !stats ? ( // Show error only if no previous stats available
               <p className="text-lg font-bold text-destructive">Error</p>
            ) : (
               <p className="text-lg font-bold">{formatTime(stats?.lastEmergencyClearance)}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
