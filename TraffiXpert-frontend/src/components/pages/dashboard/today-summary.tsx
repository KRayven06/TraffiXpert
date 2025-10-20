"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle, ShieldAlert, Timer, Car } from "lucide-react";
// Remove useSimulation hook
// import { useSimulation } from "@/context/SimulationContext";
import { useState, useEffect } from "react"; // Add useState, useEffect
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton for loading state

// --- Define Types matching Backend API responses ---

// Type for Stats (matches SimulationService.Stats record structure)
interface StatsDTO {
    totalVehicles: number;
    avgWaitTime: number; // In seconds
    vehiclesByDirection: { NORTH: number, SOUTH: number, EAST: number, WEST: number }; // Match Java Enum keys
    avgEmergencyResponse: number; // In seconds
    lastEmergencyClearance: number | null; // In seconds
}

// Type for Violation (matches Violation model, simplified for count)
interface ViolationDTO {
    id: string;
    time: string; // Assuming time comes as formatted string from backend
    location: string;
    type: string;
    fine: string;
}
// --- End Type Definitions ---

// Base URL for your Spring Boot backend API
const API_BASE_URL = 'http://localhost:8080/api';

// Define the structure for summary items, including mapping from backend data
const summaryItemsConfig = [
    { title: "Current Incidents", icon: AlertTriangle, color: "text-yellow-500", getValue: (stats: StatsDTO | null, violations: ViolationDTO[] | null) => 0 }, // Placeholder, needs dedicated endpoint/logic
    { title: "Violations Today", icon: ShieldAlert, color: "text-red-500", getValue: (stats: StatsDTO | null, violations: ViolationDTO[] | null) => violations?.length ?? 0 },
    { title: "Avg. Wait Time", icon: Timer, color: "text-blue-500", getValue: (stats: StatsDTO | null, violations: ViolationDTO[] | null) => `${stats?.avgWaitTime?.toFixed(1) ?? 'N/A'}s` },
    { title: "Total Vehicles", icon: Car, color: "text-primary", getValue: (stats: StatsDTO | null, violations: ViolationDTO[] | null) => stats?.totalVehicles?.toLocaleString() ?? 'N/A' },
];


export function TodaySummary() {
  // State for fetched data
  const [stats, setStats] = useState<StatsDTO | null>(null);
  const [violations, setViolations] = useState<ViolationDTO[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data periodically
  useEffect(() => {
    const fetchData = async () => {
      let fetchError = null;
      try {
        // Fetch stats and violations in parallel
        const [statsResponse, violationsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/stats`),
          fetch(`${API_BASE_URL}/violations`)
        ]);

        if (!statsResponse.ok) {
           fetchError = `Failed to fetch stats: ${statsResponse.status}`;
           console.error(fetchError);
        } else {
             const statsData: StatsDTO = await statsResponse.json();
             setStats(statsData);
        }

        if (!violationsResponse.ok) {
             fetchError = fetchError ? `${fetchError}; Failed to fetch violations: ${violationsResponse.status}` : `Failed to fetch violations: ${violationsResponse.status}`;
             console.error(`Failed to fetch violations: ${violationsResponse.status}`);
        } else {
            const violationsData: ViolationDTO[] = await violationsResponse.json();
            setViolations(violationsData);
        }

        if (fetchError) {
            setError(fetchError);
        } else {
            setError(null); // Clear error on success
        }

      } catch (err) {
        console.error("Error fetching summary data:", err);
        setError("Could not connect to the backend service.");
      } finally {
        // Set loading to false only after the first attempt
        if (isLoading) setIsLoading(false);
      }
    };

    fetchData(); // Initial fetch
    // Fetch summary data less frequently than the map, e.g., every 5 seconds
    const intervalId = setInterval(fetchData, 50); // 5000ms = 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval
  }, [isLoading]); // Rerun only if isLoading changes (for initial load)


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg">Today's Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          // Show skeleton loaders while loading
          summaryItemsConfig.map((item) => (
             <div key={item.title} className="flex items-center justify-between text-sm h-8">
                <div className="flex items-center gap-3">
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                    <p className="text-muted-foreground">{item.title}</p>
                </div>
                 <Skeleton className="h-5 w-12" />
             </div>
          ))
        ) : error ? (
           <p className="text-sm text-destructive">Error loading summary: {error}</p>
        ) : (
          // Render actual data once loaded
          summaryItemsConfig.map((item) => (
            <div key={item.title} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                  <p className="text-muted-foreground">{item.title}</p>
              </div>
              {/* Use the getValue function to display data */}
              <p className="font-bold text-base">{item.getValue(stats, violations)}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
