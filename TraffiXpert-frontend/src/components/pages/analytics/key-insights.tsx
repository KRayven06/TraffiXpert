"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Remove useSimulation hook
// import { useSimulation } from "@/context/SimulationContext";
import { Car, AlertTriangle, TrafficCone, ShieldCheck } from "lucide-react";
import { useMemo, useState, useEffect } from "react"; // Add useState, useEffect
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

// --- Define Types matching Backend API responses ---
interface StatsDTO {
    totalVehicles: number;
    avgWaitTime: number; // In seconds
    vehiclesByDirection: { NORTH: number, SOUTH: number, EAST: number, WEST: number }; // Match Java Enum keys
    avgEmergencyResponse: number;
    lastEmergencyClearance: number | null;
}

interface ViolationDTO {
    id: string;
    time: string; // Assuming time comes as formatted string
    location: string;
    type: string;
    fine: string;
}
// --- End Type Definitions ---

// Base URL for your Spring Boot backend API
const API_BASE_URL = 'http://localhost:8080/api';

export function KeyInsights() {
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
               fetchError = `Failed stats: ${statsResponse.status}`; // Shorter error
            } else {
                 const statsData: StatsDTO = await statsResponse.json();
                 setStats(statsData);
            }

            if (!violationsResponse.ok) {
                 fetchError = fetchError ? `${fetchError}, violations: ${violationsResponse.status}` : `Failed violations: ${violationsResponse.status}`; // Combine errors
            } else {
                const violationsData: ViolationDTO[] = await violationsResponse.json();
                setViolations(violationsData);
            }

            // Set combined error or clear it
            setError(fetchError);

          } catch (err: any) { // Catch specific error type
            console.error("Error fetching insights data:", err);
            setError(err.message || "Connection error."); // Shorter connection error
          } finally {
            // Set loading false only after first attempt
            if (isLoading) setIsLoading(false);
          }
        };

        fetchData(); // Initial fetch
        // Fetch insights data less frequently, e.g., every 10 seconds
        const intervalId = setInterval(fetchData, 10000); // 10000ms = 10 seconds

        return () => clearInterval(intervalId); // Cleanup interval
    }, [isLoading]);


    // Generate insights using useMemo based on fetched data
    const insights = useMemo(() => {
        // Return empty array if data is still loading, errored, or not yet available
        if (isLoading || error || !stats || !violations) {
            return [];
        }

        const generatedInsights = [];

        // Use NORTH, SOUTH etc. keys matching the backend DTO
        const directions = [
            { name: "North", count: stats.vehiclesByDirection.NORTH ?? 0 },
            { name: "South", count: stats.vehiclesByDirection.SOUTH ?? 0 },
            { name: "East", count: stats.vehiclesByDirection.EAST ?? 0 },
            { name: "West", count: stats.vehiclesByDirection.WEST ?? 0 },
        ];

        // Sort by count descending
        const busiestDirection = [...directions].sort((a, b) => b.count - a.count)[0];
        // Only add busiest direction insight if there are vehicles
        if (busiestDirection && busiestDirection.count > 0 && directions.some(d => d.count > 0)) {
             // Add insight only if count > 5, like original logic
            if (busiestDirection.count > 5) {
                generatedInsights.push({
                    icon: Car,
                    text: `The ${busiestDirection.name}bound direction is currently the busiest with ${busiestDirection.count} vehicles.`,
                    color: "text-blue-500",
                });
            }
        }


        // Add insight if wait time > 30 seconds
        if (stats.avgWaitTime > 30) {
            generatedInsights.push({
                icon: TrafficCone,
                text: `Average wait time is high (${stats.avgWaitTime.toFixed(1)}s), indicating potential congestion.`,
                color: "text-orange-500",
            });
        }

        // Add insight if violation count > 5
        if (violations.length > 5) {
             generatedInsights.push({
                icon: AlertTriangle,
                text: `A high number of red-light violations (${violations.length}) has been detected.`,
                color: "text-red-500",
            });
        }

        // Add default message if no specific insights generated
        if (generatedInsights.length === 0) {
            generatedInsights.push({
                icon: ShieldCheck,
                text: "Traffic flow is smooth and no major issues are detected.",
                color: "text-primary",
            });
        }

        return generatedInsights;

    }, [stats, violations, isLoading, error]); // Recompute when data changes


    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Key Insights</CardTitle>
                {/* Icon can remain static */}
                <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-5 w-4/5" />
                    </div>
                ) : error ? (
                    <p className="text-sm text-destructive">Error loading insights: {error}</p>
                ) : insights.length > 0 ? (
                    <ul className="space-y-3">
                        {insights.map((insight, index) => (
                            <li key={index} className="flex items-start gap-3 text-sm">
                                <insight.icon className={`h-5 w-5 mt-0.5 shrink-0 ${insight.color}`} />
                                <span>{insight.text}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                     <p className="text-sm text-muted-foreground">No insights available yet.</p> // Message if insights array is empty after loading
                )}
            </CardContent>
        </Card>
    );
}
