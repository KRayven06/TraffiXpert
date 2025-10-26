/* krayven06/traffixpert/TraffiXpert-92907556fcb20d7c61fc29c88abf5001b4a08109/TraffiXpert-frontend/src/components/pages/analytics/violation-metrics.tsx */
"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress"; // Import Progress
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert } from "lucide-react"; // Icon for violations

// --- Define Type matching Backend Violation DTO ---
interface ViolationDTO {
    id: string;
    time: string;
    location: string;
    type: string;
    fine: string;
}
// --- End Type Definition ---

// Base URL for your Spring Boot backend API
const API_BASE_URL = 'http://localhost:8080/api';

// Example target (adjust as needed)
// Represents a threshold. Progress bar shows how far *below* this target we are.
// 0 violations = 100% progress towards the goal. Target violations = 0% progress.
const violationTarget = 5;

export function ViolationMetrics() {
  // State for fetched violations
  const [violations, setViolations] = useState<ViolationDTO[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch violations periodically
  useEffect(() => {
    const fetchData = async () => {
      // Set loading to true only on the very first run
      if (isLoading && !violations && !error) {
         // Keep initial loading state
      } else {
         // Don't reset loading for background updates
      }

      try {
        const response = await fetch(`${API_BASE_URL}/violations`);
        if (!response.ok) {
           throw new Error(`Failed to fetch violations: ${response.status}`);
        }
        const data: ViolationDTO[] = await response.json();
        setViolations(data);
        setError(null); // Clear error on success
      } catch (err: any) { // Catch specific error type
        console.error("Error fetching violation metrics:", err);
        // Keep previous data on error if available
        if (!violations) setViolations(null);
        setError(err.message || "Could not load violations.");
      } finally {
        // Set loading false only after the first attempt
        if (isLoading) setIsLoading(false);
      }
    };

    fetchData(); // Initial fetch
    // Fetch violations data periodically, e.g., every 5 seconds
    const intervalId = setInterval(fetchData, 5000); // 5000ms = 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval
  // Dependency array ensures effect runs on mount and cleans up properly
  }, []); // Empty array runs effect once on mount

  const violationCount = violations?.length ?? 0;
  // Calculate progress: Higher percentage means closer to zero violations.
  // Value clamped between 0 and 100.
  const violationProgress = Math.max(0, Math.min(100, (1 - (violationCount / violationTarget)) * 100));

  const metrics = [
    { name: "Total Violations Today", value: violationCount, progress: violationProgress, target: `Target: < ${violationTarget}` },
    // You could add more metrics here, perhaps grouping violations by type
    // and displaying separate progress bars if needed.
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg">Violation Metrics</CardTitle>
        <CardDescription>Overview of recorded violations.</CardDescription>
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
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-3 w-32 mt-1" />
            </div>
          ))
        ) : error && !violations ? ( // Show error only if loading failed AND there's no old data
           <p className="text-sm text-destructive">Error loading metrics: {error}</p>
        ) : (
          // Render actual data (or potentially stale data if fetch failed but had previous data)
          metrics.map((metric) => (
            <div key={metric.name}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-500" /> {/* Icon */}
                    {metric.name}
                </span>
                {/* Show current count, indicate if stale */}
                <span className="text-sm font-semibold">{error && violations ? `${metric.value} (Stale)` : metric.value}</span>
              </div>
              {/* Progress Bar - styled red */}
              <Progress value={metric.progress} aria-label={`${metric.name} progress ${metric.progress.toFixed(0)}% towards target`} className="h-2 [&>div]:bg-red-500" />
              <p className="text-xs text-muted-foreground mt-1">{metric.target}</p>
            </div>
          ))
        )}
        {/* Display background fetch error discreetly if needed */}
        {error && violations && <p className="text-xs text-destructive/80 mt-2">Error updating data: {error}</p>}
      </CardContent>
    </Card>
  );
}