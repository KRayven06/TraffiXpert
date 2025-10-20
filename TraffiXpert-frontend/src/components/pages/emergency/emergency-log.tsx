"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
// Remove useSimulation hook
// import { useSimulation } from "@/context/SimulationContext";
import { useState, useEffect } from "react"; // Add useState, useEffect
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

// --- Define Type matching Backend EmergencyEvent Model/DTO ---
interface EmergencyEventDTO {
    id: string;
    time: string; // Assuming time comes as formatted string from backend
    type: string;
    clearanceTime: number; // Assuming clearance time is in seconds
}
// --- End Type Definition ---

// Base URL for your Spring Boot backend API
const API_BASE_URL = 'http://localhost:8080/api';

export function EmergencyLog() {
  // State for fetched emergency log
  const [emergencyLog, setEmergencyLog] = useState<EmergencyEventDTO[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch emergency log periodically
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/emergency/log`);
        if (!response.ok) {
           throw new Error(`Failed to fetch emergency log: ${response.status}`);
        }
        const data: EmergencyEventDTO[] = await response.json();
        setEmergencyLog(data);
        setError(null); // Clear error on success
      } catch (err: any) { // Catch specific error type
        console.error("Error fetching emergency log:", err);
        setError(err.message || "Could not load log.");
      } finally {
        if (isLoading) setIsLoading(false);
      }
    };

    fetchData(); // Initial fetch
    // Fetch log data less frequently, e.g., every 10 seconds
    const intervalId = setInterval(fetchData, 10000); // 10000ms = 10 seconds

    return () => clearInterval(intervalId); // Cleanup interval
  }, [isLoading]); // Rerun only if isLoading changes

  return (
    <Card className="h-full"> {/* Use full height */}
      <CardHeader>
        <CardTitle className="font-headline text-lg">Emergency Event Log</CardTitle>
      </CardHeader>
       <CardContent className="h-[calc(100%-4rem)] p-0"> {/* Adjust height */}
        <ScrollArea className="h-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead className="text-right">Clearance Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Show skeleton rows while loading
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-destructive">
                    Error loading log: {error}
                  </TableCell>
                </TableRow>
              ) : emergencyLog && emergencyLog.length > 0 ? (
                // Render actual log rows
                emergencyLog.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-mono text-xs">{event.time}</TableCell>
                    <TableCell>{event.type}</TableCell>
                    <TableCell className="text-right">{event.clearanceTime.toFixed(1)}s</TableCell>
                  </TableRow>
                ))
              ) : (
                // Show message if log is empty
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No emergency events recorded.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
