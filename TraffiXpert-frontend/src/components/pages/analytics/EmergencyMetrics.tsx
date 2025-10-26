/* krayven06/traffixpert/TraffiXpert-92907556fcb20d7c61fc29c88abf5001b4a08109/TraffiXpert-frontend/src/components/pages/analytics/emergency-metrics.tsx */
"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress"; // Import Progress
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Siren, Zap } from "lucide-react"; // Icons for emergency

// --- Define Type for Stats (matches backend DTO/Record) ---
interface StatsDTO {
    totalVehicles: number;
    avgWaitTime: number;
    vehiclesByDirection: { NORTH: number, SOUTH: number, EAST: number, WEST: number };
    avgEmergencyResponse: number; // In seconds
    lastEmergencyClearance: number | null; // In seconds
}

// --- NEW: Type for Incident Count Response ---
interface IncidentCountDTO {
    incidentCount: number;
}
// --- End Type Definitions ---

// Base URL for your Spring Boot backend API
const API_BASE_URL = 'http://localhost:8080/api';

// Example targets (adjust as needed)
const avgResponseTarget = 15; // Target average response time in seconds (lower is better)
const incidentTarget = 3;    // Target max incidents per day (lower is better)

export function EmergencyMetrics() {
  // State for fetched data
  const [stats, setStats] = useState<StatsDTO | null>(null);
  const [incidentCount, setIncidentCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data periodically
  useEffect(() => {
    const fetchData = async () => {
      let fetchError = null;
      // Set loading to true only on the very first run
      if (isLoading && !stats && incidentCount === null && !error) {
         // Keep initial loading state
      } else {
         // Don't reset loading for background updates
      }

      try {
        // Fetch stats and incidents in parallel
        const [statsResponse, incidentsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/stats`),
          fetch(`${API_BASE_URL}/stats/incidents`)
        ]);

        if (!statsResponse.ok) {
           fetchError = `Failed stats: ${statsResponse.status}`;
        } else {
             const statsData: StatsDTO = await statsResponse.json();
             setStats(statsData);
        }

        if (!incidentsResponse.ok) {
             const errorMsg = `Failed incidents: ${incidentsResponse.status}`;
             fetchError = fetchError ? `${fetchError}, ${errorMsg}` : errorMsg;
        } else {
            const incidentsData: IncidentCountDTO = await incidentsResponse.json();
            setIncidentCount(incidentsData.incidentCount);
        }

        setError(fetchError); // Set combined error or null

      } catch (err: any) { // Catch specific error type
        console.error("Error fetching emergency metrics:", err);
        // Keep previous data on error if available
        if (!stats) setStats(null);
        if (incidentCount === null) setIncidentCount(null);
        setError(err.message || "Connection error.");
      } finally {
        // Set loading false only after the first attempt
        if (isLoading) setIsLoading(false);
      }
    };

    fetchData(); // Initial fetch
    // Fetch data periodically, e.g., every 5 seconds
    const intervalId = setInterval(fetchData, 5000); // 5000ms = 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval
  // Dependency array ensures effect runs on mount and cleans up properly
  }, []); // Empty array runs effect once on mount

  // Calculate progress towards targets (lower values are better)
  // Value clamped between 0 and 100
  const avgResponseProgress = stats ? Math.max(0, Math.min(100, (1 - (stats.avgEmergencyResponse / avgResponseTarget)) * 100)) : 0;
  const incidentProgress = incidentCount !== null ? Math.max(0, Math.min(100, (1 - (incidentCount / incidentTarget)) * 100)) : 0;


  const metrics = [
    { name: "Avg. Emergency Response", value: stats?.avgEmergencyResponse, progress: avgResponseProgress, target: `Target: < ${avgResponseTarget}s` },
    { name: "Total Incidents Today", value: incidentCount, progress: incidentProgress, target: `Target: < ${incidentTarget}` },
    { name: "Last Clearance Time", value: stats?.lastEmergencyClearance, target: `(Last recorded)` }, // No progress bar for last time
  ];

  const formatTime = (seconds: number | null | undefined): string => {
      if (seconds === null || seconds === undefined || isNaN(seconds)) {
          return "N/A";
      }
      return `${seconds.toFixed(1)}s`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg">Emergency Metrics</CardTitle>
        <CardDescription>Response times and incident counts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          // Show skeleton loaders while initially loading
          metrics.map((metric) => (
            <div key={metric.name}>
              <div className="flex justify-between mb-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-12" />
              </div>
              {/* Only show progress skeleton for relevant metrics */}
              {metric.name !== "Last Clearance Time" && <Skeleton className="h-2 w-full" />}
              <Skeleton className="h-3 w-32 mt-1" />
            </div>
          ))
        ) : error && !stats && incidentCount === null ? ( // Show error only if loading failed AND there's no old data
           <p className="text-sm text-destructive">Error loading metrics: {error}</p>
        ) : (
          // Render actual data (or potentially stale data if fetch failed but had previous data)
          metrics.map((metric) => (
            <div key={metric.name}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium flex items-center gap-2">
                    {/* Icons based on metric name */}
                    {metric.name.includes("Emergency") && <Siren className="w-4 h-4 text-orange-500" />}
                    {metric.name.includes("Incidents") && <Siren className="w-4 h-4 text-orange-500" />}
                    {metric.name.includes("Clearance") && <Zap className="w-4 h-4 text-yellow-500" />}
                    {metric.name}
                </span>
                <span className="text-sm font-semibold">
                    {/* Show current values, indicate if stale */}
                    {metric.name === "Total Incidents Today"
                        ? (error && incidentCount !== null ? `${metric.value ?? 'N/A'} (Stale)` : metric.value ?? 'N/A')
                        : (error && stats ? `${formatTime(metric.value)} (Stale)` : formatTime(metric.value))}
                </span>
              </div>
              {/* --- MODIFIED: Conditionally render Progress Bar --- */}
              {metric.name !== "Last Clearance Time" && (
                <Progress
                  value={metric.progress}
                  aria-label={`${metric.name} progress ${metric.progress?.toFixed(0)}% towards target`}
                  className="h-2 [&>div]:bg-orange-500" // Styled orange
                />
              )}
              <p className="text-xs text-muted-foreground mt-1">{metric.target}</p>
            </div>
          ))
        )}
        {/* Display background fetch error discreetly if needed */}
        {error && (stats || incidentCount !== null) && <p className="text-xs text-destructive/80 mt-2">Error updating data: {error}</p>}
      </CardContent>
    </Card>
  );
}