"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
// Remove useSimulation hook
// import { useSimulation } from "@/context/SimulationContext";
import { useState, useEffect } from "react"; // Add useState, useEffect
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

// --- Define Type for Stats (matches backend DTO/Record) ---
interface StatsDTO {
    totalVehicles: number;
    avgWaitTime: number; // In seconds
    vehiclesByDirection: { NORTH: number, SOUTH: number, EAST: number, WEST: number };
    avgEmergencyResponse: number;
    lastEmergencyClearance: number | null;
}
// --- End Type Definition ---

// Base URL for your Spring Boot backend API
const API_BASE_URL = 'http://localhost:8080/api';

// Targets remain the same as original component
const targets = {
  avgWaitTime: 40,
  trafficFlowEfficiency: 90,
  signalOptimization: 95, // Note: Signal Optimization might need a dedicated backend value later
};

export function PerformanceMetrics() {
  // State for fetched stats data
  const [stats, setStats] = useState<StatsDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

   // State for signal optimization (simulated, as backend doesn't provide it yet)
  const [signalOptimization, setSignalOptimization] = useState(0);

  // Fetch stats periodically
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/stats`);
        if (!response.ok) {
           throw new Error(`Failed to fetch stats: ${response.status}`);
        }
        const data: StatsDTO = await response.json();
        setStats(data);
        setError(null);

        // Simulate signal optimization based on fetched stats (similar to original)
        // TODO: Replace with actual backend value if available
        const isAutoMode = data.avgWaitTime < 50; // Simple heuristic based on wait time for demo
        const newSignalOptimization = isAutoMode ? 92 + Math.random() * 5 : 65 + Math.random() * 10;
        setSignalOptimization(newSignalOptimization);

      } catch (err: any) { // Catch specific error type
        console.error("Error fetching performance metrics:", err);
        setError(err.message || "Could not load metrics.");
      } finally {
        if (isLoading) setIsLoading(false);
      }
    };

    fetchData(); // Initial fetch
    // Fetch stats periodically, e.g., every 5 seconds
    const intervalId = setInterval(fetchData, 5000); // 5000ms = 5 seconds

    return () => clearInterval(intervalId); // Cleanup
  }, [isLoading]);


  // Calculate metrics based on fetched stats or show loading/error values
  const waitTimeReduction = stats ? Math.max(0, (1 - stats.avgWaitTime / targets.avgWaitTime) * 100) : 0;

  const currentVehicleCount = stats
      ? Object.values(stats.vehiclesByDirection).reduce((a, b) => a + b, 0)
      : 0;
  const trafficFlowEfficiency = stats && (stats.totalVehicles + currentVehicleCount) > 0
      ? (stats.totalVehicles / (stats.totalVehicles + currentVehicleCount)) * 100
      : (stats ? 100 : 0); // Assume 100% if totalVehicles > 0 but current is 0, else 0 if no stats


  const metrics = [
    { name: "Average Wait Time Reduction", value: waitTimeReduction, target: `Target: < ${targets.avgWaitTime}s` },
    { name: "Traffic Flow Efficiency", value: trafficFlowEfficiency, target: `Target: > ${targets.trafficFlowEfficiency}%` },
    // Use the state for signal optimization
    { name: "Signal Optimization", value: signalOptimization, target: `Target: ${targets.signalOptimization}%` },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg">Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          // Show skeleton loaders while loading
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
        ) : error ? (
           <p className="text-sm text-destructive">Error loading metrics: {error}</p>
        ) : (
          // Render actual data once loaded
          metrics.map((metric) => (
            <div key={metric.name}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{metric.name}</span>
                <span className="text-sm text-muted-foreground">{metric.value.toFixed(1)}%</span>
              </div>
              <Progress value={metric.value} aria-label={`${metric.name} at ${metric.value.toFixed(1)}%`} />
              <p className="text-xs text-muted-foreground mt-1">{metric.target}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
