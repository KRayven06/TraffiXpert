"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ChartTooltipContent, ChartContainer, type ChartConfig } from "@/components/ui/chart";
// Remove useSimulation hook
// import { useSimulation } from "@/context/SimulationContext";
import { useEffect, useState } from "react"; // Add useState, useEffect
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

const chartConfig = {
  volume: {
    label: "Volume",
    color: "hsl(var(--primary))",
  },
   // Add keys for each direction if needed for more complex charts/tooltips
   NORTH: { label: "North", color: "hsl(var(--chart-1))" },
   SOUTH: { label: "South", color: "hsl(var(--chart-2))" },
   EAST: { label: "East", color: "hsl(var(--chart-3))" },
   WEST: { label: "West", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

export function TrafficTrends() {
  // State for fetched stats data
  const [stats, setStats] = useState<StatsDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for historical throughput data (collected client-side based on stats)
  const [throughputData, setThroughputData] = useState<{time: string, volume: number}[]>([]);

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

         // Update throughput data when new stats arrive
         const now = new Date();
         const timeLabel = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
         // Calculate current total vehicles on roads from the new stats
         const currentVolume = data ? Object.values(data.vehiclesByDirection).reduce((a, b) => a + b, 0) : 0;

         setThroughputData(prevData => {
           const newData = [...prevData, { time: timeLabel, volume: currentVolume }];
           // Keep only the last 6 entries (similar to original logic)
           if (newData.length > 6) {
             return newData.slice(newData.length - 6);
           }
           return newData;
         });

      } catch (err: any) { // Catch specific error type
        console.error("Error fetching traffic trends:", err);
        setError(err.message || "Could not load trends.");
        // Don't update throughput if fetch fails
      } finally {
        if (isLoading) setIsLoading(false);
      }
    };

    fetchData(); // Initial fetch
    // Fetch stats every 2 seconds for trends
    const intervalId = setInterval(fetchData, 2000); // 2000ms = 2 seconds

    return () => clearInterval(intervalId); // Cleanup
  }, [isLoading]); // Rerun effect only if isLoading changes

  // Transform fetched stats data for the "Live Volume by Direction" chart
  const liveVolumeData = stats ? [
    { direction: "North", volume: stats.vehiclesByDirection.NORTH ?? 0 },
    { direction: "South", volume: stats.vehiclesByDirection.SOUTH ?? 0 },
    { direction: "East", volume: stats.vehiclesByDirection.EAST ?? 0 },
    { direction: "West", volume: stats.vehiclesByDirection.WEST ?? 0 },
  ] : []; // Provide empty array if stats is null


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg">Live Traffic Trends</CardTitle>
        <CardDescription>Real-time data from the simulation.</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-8">
        {/* Live Volume Chart */}
        <div>
          <h3 className="text-md font-semibold mb-2">Live Volume by Direction</h3>
          <div className="h-[200px]">
             {isLoading ? (
                <Skeleton className="h-full w-full" />
             ) : error ? (
                <div className="flex items-center justify-center h-full text-sm text-destructive">{error}</div>
             ) : (
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={liveVolumeData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="direction" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip
                        content={<ChartTooltipContent />}
                        cursor={{ fill: 'hsl(var(--muted))' }}
                      />
                      <Bar dataKey="volume" fill="var(--color-volume)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
             )}
          </div>
        </div>
        {/* Throughput Chart */}
        <div>
          <h3 className="text-md font-semibold mb-2">Recent Vehicle Throughput</h3>
          <div className="h-[200px]">
             {isLoading && throughputData.length === 0 ? ( // Show skeleton only if initially loading AND no data yet
                <Skeleton className="h-full w-full" />
             ) : error && throughputData.length === 0 ? ( // Show error only if initially error AND no data yet
                <div className="flex items-center justify-center h-full text-sm text-destructive">{error}</div>
             ) : (
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={throughputData}> {/* Use client-side collected throughputData */}
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip
                         content={<ChartTooltipContent />}
                         cursor={{ fill: 'hsl(var(--muted))' }}
                      />
                      <Bar dataKey="volume" fill="var(--color-volume)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
             )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
