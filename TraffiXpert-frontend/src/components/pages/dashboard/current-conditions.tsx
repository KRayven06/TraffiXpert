'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sun, Cloud, Waves, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

// --- Define Type for Stats (matches backend DTO/Record) ---
interface StatsDTO {
    totalVehicles: number;
    avgWaitTime: number;
    vehiclesByDirection: { NORTH: number, SOUTH: number, EAST: number, WEST: number }; // Match Java Enum keys
    avgEmergencyResponse: number;
    lastEmergencyClearance: number | null;
}
// --- End Type Definition ---

// Base URL for your Spring Boot backend API
const API_BASE_URL = 'http://localhost:8080/api';

const weatherIcons = [
    <Sun key="sun" className="h-6 w-6 text-yellow-500" />,
    <Cloud key="cloud" className="h-6 w-6 text-sky-400" />,
];

export function CurrentConditions() {
    // State for fetched stats
    const [stats, setStats] = useState<StatsDTO | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(true); // Separate loading for stats
    const [statsError, setStatsError] = useState<string | null>(null);

    // State for weather icon and time (client-side only)
    const [currentWeatherIconIndex, setCurrentWeatherIconIndex] = useState(0);
    const [currentTime, setCurrentTime] = useState<Date | null>(null);
    const [isMounted, setIsMounted] = useState(false); // For hydration fix

    // Effect for client-side mounting and time/weather updates
    useEffect(() => {
        setIsMounted(true);
        setCurrentTime(new Date());

        const weatherInterval = setInterval(() => {
            setCurrentWeatherIconIndex((prevIndex) => (prevIndex + 1) % weatherIcons.length);
        }, 5000);

        const timeInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => {
            clearInterval(weatherInterval);
            clearInterval(timeInterval);
        };
    }, []); // Runs once on mount

    // Effect for fetching stats data periodically
    useEffect(() => {
        const fetchStatsData = async () => {
          try {
            const response = await fetch(`${API_BASE_URL}/stats`);
            if (!response.ok) {
               throw new Error(`Failed to fetch stats: ${response.status}`);
            }
            const data: StatsDTO = await response.json();
            setStats(data);
            setStatsError(null); // Clear error on success
          } catch (err) {
            console.error("Error fetching stats for conditions:", err);
            setStatsError("Could not load stats.");
          } finally {
            if (isLoadingStats) setIsLoadingStats(false);
          }
        };

        fetchStatsData(); // Initial fetch
        // Fetch stats less frequently, e.g., every 5 seconds
        const intervalId = setInterval(fetchStatsData, 5000);

        return () => clearInterval(intervalId); // Cleanup
    }, [isLoadingStats]); // Rerun only if isLoadingStats changes

    // Calculate total vehicles currently on roads from stats
    const currentTotalVehicles = stats
        ? Object.values(stats.vehiclesByDirection).reduce((a, b) => a + b, 0)
        : 0; // Default to 0 if stats not loaded

    const getTrafficDensity = () => {
        if (isLoadingStats) return <Skeleton className="h-4 w-16 inline-block" />; // Show skeleton while loading
        if (statsError) return <span className="text-destructive">Error</span>; // Show error
        if (currentTotalVehicles < 10) return "Low";
        if (currentTotalVehicles < 20) return "Moderate";
        return "High";
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-lg">Current Conditions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
                {/* Weather (static for now) */}
                <div className="flex items-center gap-3">
                    {weatherIcons[currentWeatherIconIndex]}
                    <div>
                        <p className="font-semibold">Weather</p>
                        <p className="text-muted-foreground">Clear, 24°C</p>
                    </div>
                </div>
                {/* Traffic Density (from fetched stats) */}
                <div className="flex items-center gap-3">
                    <Waves className="h-6 w-6 text-blue-500" />
                    <div>
                        <p className="font-semibold">Traffic Density</p>
                        {/* CORRECTED: Changed <p> to <span> */}
                        <span className="text-muted-foreground">{getTrafficDensity()}</span>
                    </div>
                </div>
                {/* Current Time (client-side only) */}
                <div className="flex items-center col-span-2 gap-3">
                    <Clock className="h-6 w-6 text-primary" />
                    <div>
                        <p className="font-semibold">Current Time</p>
                        <p className="text-muted-foreground">
                            {isMounted && currentTime ? currentTime.toLocaleTimeString() : 'Loading...'}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
