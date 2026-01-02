/* krayven06/traffixpert/TraffiXpert-92907556fcb20d7c61fc29c88abf5001b4a08109/TraffiXpert-frontend/src/components/pages/analytics/violation-metrics.tsx */
"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress"; // Import Progress
import useSWR from "swr";
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
import { API_BASE_URL } from "@/lib/config";

// Example target (adjust as needed)
// Represents a threshold. Progress bar shows how far *below* this target we are.
// 0 violations = 100% progress towards the goal. Target violations = 0% progress.
const violationTarget = 5;

export function ViolationMetrics() {
  // Use SWR for auto-caching, revalidation, and deduping
  const { data: violations, error: violationsError } = useSWR<ViolationDTO[]>(`${API_BASE_URL}/violations`, async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch violations");
    return res.json();
  }, { refreshInterval: 5000 });

  const isLoading = !violations && !violationsError;
  const error = violationsError ? "Could not load violations." : null;

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