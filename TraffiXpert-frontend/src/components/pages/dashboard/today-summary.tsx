"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle, Timer, Activity, ShieldAlert } from "lucide-react";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE_URL } from "@/lib/config";

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

interface IncidentCountDTO {
    incidentCount: number;
}
// --- End Type Definitions ---

// Fetcher function for SWR
const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error("Failed to fetch");
    }
    return res.json();
};

export function TodaySummary() {
    // Use SWR for auto-caching, revalidation, and deduping
    const { data: stats, error: statsError } = useSWR<StatsDTO>(`${API_BASE_URL}/stats`, fetcher, { refreshInterval: 5000 });
    const { data: violations, error: violationsError } = useSWR<ViolationDTO[]>(`${API_BASE_URL}/violations`, fetcher, { refreshInterval: 5000 });
    const { data: incidentData, error: incidentError } = useSWR<IncidentCountDTO>(`${API_BASE_URL}/stats/incidents`, fetcher, { refreshInterval: 5000 });

    const isLoading = (!stats && !statsError) || (!violations && !violationsError) || (!incidentData && !incidentError);
    const error = statsError || violationsError || incidentError;

    // Calculate values safely
    const totalViolations = violations ? violations.length : 0;
    const currentIncidents = incidentData ? incidentData.incidentCount : 0;
    const activeVehicles = stats ? stats.totalVehicles : 0;
    const avgWaitTime = stats ? stats.avgWaitTime.toFixed(1) : "0.0";

    // Summary Items Configuration
    const summaryItems = [
        { 
            title: "Current Incidents", 
            icon: AlertTriangle, 
            color: "text-yellow-500", 
            value: isLoading ? "..." : currentIncidents.toString()
        },
        { 
            title: "Violations Today", 
            icon: ShieldAlert, 
            color: "text-red-500", 
            value: isLoading ? "..." : totalViolations.toString()
        },
        { 
            title: "Avg. Wait Time", 
            icon: Timer, 
            color: "text-blue-500", 
            value: isLoading ? "..." : `${avgWaitTime}s`
        },
        { 
            title: "Total Vehicles", 
            icon: Activity, 
            color: "text-primary", 
            value: isLoading ? "..." : activeVehicles.toLocaleString()
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-lg">Today's Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    // Skeleton Loaders
                     summaryItems.map((item) => (
                        <div key={item.title} className="flex items-center justify-between text-sm h-8">
                            <div className="flex items-center gap-3">
                                <item.icon className={`h-5 w-5 ${item.color}`} />
                                <p className="text-muted-foreground">{item.title}</p>
                            </div>
                            <Skeleton className="h-5 w-12" />
                        </div>
                    ))
                ) : error ? (
                    <p className="text-sm text-destructive">Error loading data. Retrying...</p>
                ) : (
                    // Actual Data
                    summaryItems.map((item) => (
                        <div key={item.title} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                                <item.icon className={`h-5 w-5 ${item.color}`} />
                                <p className="text-muted-foreground">{item.title}</p>
                            </div>
                            <p className="font-bold text-base">{item.value}</p>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}