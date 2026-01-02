```
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle, Users, Coins, Activity } from "lucide-react";
import useSWR from "swr";
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
import { API_BASE_URL } from "@/lib/config";

export function TodaySummary() {
                     // Keep previous state on error
                    // setViolations(null);
                } else {
                    const violationsData: ViolationDTO[] = await violationsResponse.json();
                    setViolations(violationsData);
                }

                // --- NEW: Process Incidents ---
                if (!incidentsResponse.ok) {
                    const errorMsg = `Failed incidents: ${incidentsResponse.status}`;
                    fetchError = fetchError ? `${fetchError}; ${errorMsg}` : errorMsg;
                    console.error(errorMsg);
                     // Keep previous state on error
                    // setIncidentCount(null);
                } else {
                    const incidentsData: IncidentCountDTO = await incidentsResponse.json();
                    setIncidentCount(incidentsData.incidentCount);
                }
                // --- End NEW ---

                // Set error state based on fetch results
                 setError(fetchError); // Set to null if all fetches were ok, or combined error message

            } catch (err) {
                console.error("Error fetching summary data:", err);
                setError("Could not connect to the backend service.");
                 // Keep previous state on connection error
                // if (!stats) setStats(null);
                // if (!violations) setViolations(null);
                // if (incidentCount === null) setIncidentCount(null);
            } finally {
                // Only set isLoading to false after the *first* attempt
                if (isLoading) setIsLoading(false);
            }
        };

        fetchData(); // Initial fetch
        const intervalId = setInterval(fetchData, 100); // Fetch every 0.1 seconds

        // Cleanup function: clear interval when component unmounts
        return () => clearInterval(intervalId);
    // *** CORRECTED DEPENDENCY ARRAY: Changed from [isLoading] to [] ***
    }, []); // Empty array ensures this effect runs only once on mount

    // Calculate derived values safely
  const totalViolations = violations ? violations.length : 0;
  const totalIncidents = incidentsData ? incidentsData.incidentCount : 0;
  const activeVehicles = stats ? stats.totalVehicles : 0;
  const avgWaitTime = stats ? Math.round(stats.avgWaitTime) : 0;

    // Define the structure for summary items, including mapping from backend data
    const summaryItemsConfig = [
        { title: "Current Incidents", icon: AlertTriangle, color: "text-yellow-500", getValue: () => incidentCount ?? (isLoading ? '...' : 'N/A') },
        { title: "Violations Today", icon: ShieldAlert, color: "text-red-500", getValue: () => violations?.length ?? (isLoading ? '...' : 'N/A') },
        { title: "Avg. Wait Time", icon: Timer, color: "text-blue-500", getValue: () => stats ? `${stats.avgWaitTime.toFixed(1)}s` : (isLoading ? '...' : 'N/A') },
        { title: "Total Vehicles", icon: Car, color: "text-primary", getValue: () => stats ? stats.totalVehicles.toLocaleString() : (isLoading ? '...' : 'N/A') },
    ];


    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-lg">Today's Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading && !stats && !violations && incidentCount === null ? ( // Show skeleton only on initial load AND if no data exists yet
                    // Show skeleton loaders while initially loading
                    summaryItemsConfig.map((item) => (
                        <div key={item.title} className="flex items-center justify-between text-sm h-8">
                            <div className="flex items-center gap-3">
                                <item.icon className={`h-5 w-5 ${item.color}`} />
                                <p className="text-muted-foreground">{item.title}</p>
                            </div>
                            <Skeleton className="h-5 w-12" />
                        </div>
                    ))
                ) : error && !stats && !violations && incidentCount === null ? ( // Show error only if initial load failed AND no data exists yet
                    <p className="text-sm text-destructive">Error loading summary: {error}</p>
                ) : (
                    // Render actual data (or 'N/A' or '...' if specific parts failed but others loaded)
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