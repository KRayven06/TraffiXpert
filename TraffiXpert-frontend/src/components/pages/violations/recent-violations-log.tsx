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

// --- Define Type matching Backend Violation Model/DTO ---
interface ViolationDTO {
    id: string;
    time: string; // Assuming time comes as formatted string from backend (e.g., HH:mm:ss)
    location: string;
    type: string;
    fine: string;
}
// --- End Type Definition ---

// Base URL for your Spring Boot backend API
const API_BASE_URL = 'http://localhost:8080/api';

export function RecentViolationsLog() {
  // State for fetched violations
  const [violations, setViolations] = useState<ViolationDTO[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch violations periodically
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/violations`);
        if (!response.ok) {
           throw new Error(`Failed to fetch violations: ${response.status}`);
        }
        const data: ViolationDTO[] = await response.json();
        setViolations(data);
        setError(null); // Clear error on success
      } catch (err: any) { // Catch specific error type
        console.error("Error fetching violations log:", err);
        setError(err.message || "Could not load violations.");
      } finally {
        if (isLoading) setIsLoading(false);
      }
    };

    fetchData(); // Initial fetch
    // Fetch violations data less frequently, e.g., every 5 seconds
    const intervalId = setInterval(fetchData, 5000); // 5000ms = 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval
  }, [isLoading]); // Rerun only if isLoading changes

  return (
    <Card className="h-full"> {/* Use full height */}
      <CardHeader>
        <CardTitle className="font-headline text-lg">Recent Violations Log</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-4rem)] p-0"> {/* Adjust height accounting for header padding */}
        <ScrollArea className="h-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Fine</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Show skeleton rows while loading
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-10 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-destructive">
                    Error loading violations: {error}
                  </TableCell>
                </TableRow>
              ) : violations && violations.length > 0 ? (
                // Render actual violation rows
                violations.map((violation) => (
                  <TableRow key={violation.id}>
                    <TableCell className="font-mono text-xs">{violation.time}</TableCell>
                    <TableCell>{violation.location}</TableCell>
                    <TableCell>{violation.type}</TableCell>
                    <TableCell className="text-right">{violation.fine}</TableCell>
                  </TableRow>
                ))
              ) : (
                // Show message if no violations
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No recent violations recorded.
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
