"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle, ShieldAlert, Timer, Car } from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// --- Define Types matching Backend API responses ---
interface StatsDTO {
    totalVehicles: number;
    avgWaitTime: number; // In seconds
    vehiclesByDirection: { NORTH: number, SOUTH: number, EAST: number, WEST: number };
    avgEmergencyResponse: number; // In seconds
    lastEmergencyClearance: number | null; // In seconds
}

interface ViolationDTO {
    id: string;
    time: string;
    location: string;
    type: string;
    fine: string;
}

// --- NEW: Type for Incident Count Response ---
interface IncidentCountDTO {
    incidentCount: number;
}
// --- End Type Definitions ---

// Base URL for your Spring Boot backend API
const API_BASE_URL = 'http://localhost:8080/api';

export function TodaySummary() {
    // State for fetched data
    const [stats, setStats] = useState<StatsDTO | null>(null);
    const [violations, setViolations] = useState<ViolationDTO[] | null>(null);
    const [incidentCount, setIncidentCount] = useState<number | null>(null); // NEW state for incidents
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch data periodically
    useEffect(() => {
        const fetchData = async () => {
            let fetchError = null;
            try {
                // Fetch stats, violations, and incidents in parallel
                const [statsResponse, violationsResponse, incidentsResponse] = await Promise.all([ // Added incidentsResponse
                    fetch(`${API_BASE_URL}/stats`),
                    fetch(`${API_BASE_URL}/violations`),
                    fetch(`${API_BASE_URL}/stats/incidents`) // Fetch from new endpoint
                ]);

                // Process Stats
                if (!statsResponse.ok) {
                    fetchError = `Failed stats: ${statsResponse.status}`;
                    console.error(fetchError);
                } else {
                    const statsData: StatsDTO = await statsResponse.json();
                    setStats(statsData);
                }

                // Process Violations
                if (!violationsResponse.ok) {
                    const errorMsg = `Failed violations: ${violationsResponse.status}`;
                    fetchError = fetchError ? `${fetchError}; ${errorMsg}` : errorMsg;
                    console.error(errorMsg);
                } else {
                    const violationsData: ViolationDTO[] = await violationsResponse.json();
                    setViolations(violationsData);
                }

                // --- NEW: Process Incidents ---
                if (!incidentsResponse.ok) {
                    const errorMsg = `Failed incidents: ${incidentsResponse.status}`;
                    fetchError = fetchError ? `${fetchError}; ${errorMsg}` : errorMsg;
                    console.error(errorMsg);
                    setIncidentCount(null); // Clear incident count on error if not previously set
                } else {
                    const incidentsData: IncidentCountDTO = await incidentsResponse.json();
                    setIncidentCount(incidentsData.incidentCount);
                }
                // --- End NEW ---

                if (fetchError) {
                    setError(fetchError);
                } else {
                    setError(null); // Clear error on success
                }

            } catch (err) {
                console.error("Error fetching summary data:", err);
                setError("Could not connect to the backend service.");
                // Clear all data on connection error if not previously set
                if (!stats) setStats(null);
                if (!violations) setViolations(null);
                if (incidentCount === null) setIncidentCount(null);
            } finally {
                if (isLoading) setIsLoading(false);
            }
        };

        fetchData(); // Initial fetch
        const intervalId = setInterval(fetchData, 100); // Fetch every 0.1 seconds

        return () => clearInterval(intervalId);
    }, [isLoading]); // Rerun only if isLoading changes


    // Define the structure for summary items, including mapping from backend data
    // --- UPDATED Incidents Value ---
    const summaryItemsConfig = [
        { title: "Current Incidents", icon: AlertTriangle, color: "text-yellow-500", getValue: () => incidentCount ?? 'N/A' },
        { title: "Violations Today", icon: ShieldAlert, color: "text-red-500", getValue: () => violations?.length ?? 'N/A' },
        { title: "Avg. Wait Time", icon: Timer, color: "text-blue-500", getValue: () => `${stats?.avgWaitTime?.toFixed(1) ?? 'N/A'}s` },
        { title: "Total Vehicles", icon: Car, color: "text-primary", getValue: () => stats?.totalVehicles?.toLocaleString() ?? 'N/A' },
    ];
    // --- End Update ---

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
                            <p className="font-bold text-base">{item.getValue()}</p>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}