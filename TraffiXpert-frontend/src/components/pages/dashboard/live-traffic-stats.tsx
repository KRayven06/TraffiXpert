"use client";

import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"; // Added Tooltip
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartTooltipContent, ChartContainer } from "@/components/ui/chart"; // Import Chart components
import { useState, useEffect } from "react"; // Add useState, useEffect
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

// Chart configuration (optional but good practice with shadcn charts)
const chartConfig = {
  total: {
    label: "Vehicles",
    color: "hsl(var(--primary))",
  },
};

export function LiveTrafficStats() {
  // State for fetched stats data
  const [stats, setStats] = useState<StatsDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } catch (err) {
        console.error("Error fetching live traffic stats:", err);
        setError("Could not load stats.");
      } finally {
        if (isLoading) setIsLoading(false);
      }
    };

    fetchData(); // Initial fetch
    // Fetch stats less frequently than the map, e.g., every 2 seconds
    const intervalId = setInterval(fetchData, 100); // 2000ms = 2 seconds

    return () => clearInterval(intervalId); // Cleanup
  }, [isLoading]);

  // Transform fetched stats data into the format needed by the chart
  const roadData = stats ? [
    { name: "North", total: stats.vehiclesByDirection.NORTH ?? 0 },
    { name: "South", total: stats.vehiclesByDirection.SOUTH ?? 0 },
    { name: "East", total: stats.vehiclesByDirection.EAST ?? 0 },
    { name: "West", total: stats.vehiclesByDirection.WEST ?? 0 },
  ] : []; // Provide empty array if stats is null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg">Live Traffic Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          {isLoading ? (
             <Skeleton className="h-full w-full" />
          ) : error ? (
             <div className="flex items-center justify-center h-full text-sm text-destructive">{error}</div>
          ) : (
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roadData} layout="vertical" margin={{ right: 20 }}> {/* Added right margin */}
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={50}
                  />
                  {/* Added Tooltip for hover effect */}
                  <Tooltip
                     cursor={{ fill: 'hsl(var(--muted))' }}
                     content={<ChartTooltipContent indicator="line" />}
                   />
                  <Bar dataKey="total" fill="var(--color-total, hsl(var(--primary)))" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
             </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
