"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
// Remove useSimulation hook
// import { useSimulation } from "@/context/SimulationContext";
import { useState, useEffect } from "react"; // Add useState, useEffect
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { DollarSign } from "lucide-react";

// --- Define Type matching Backend Violation Model/DTO ---
interface ViolationDTO {
    id: string;
    time: string;
    location: string;
    type: string;
    fine: string; // Keep as string as per original model
}
// --- End Type Definition ---

// Base URL for your Spring Boot backend API
const API_BASE_URL = 'http://localhost:8080/api';

export function FineCollection() {
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
        console.error("Error fetching fine collection data:", err);
        setError(err.message || "Could not load data.");
      } finally {
        if (isLoading) setIsLoading(false);
      }
    };

    fetchData(); // Initial fetch
    // Fetch violations data less frequently, e.g., every 10 seconds
    const intervalId = setInterval(fetchData, 10000); // 10000ms = 10 seconds

    return () => clearInterval(intervalId); // Cleanup interval
  }, [isLoading]); // Rerun only if isLoading changes

  // Calculate total fines based on fetched violations
  const totalFines = violations?.reduce((sum, violation) => {
    // Extract number from fine string (e.g., "$150" -> 150)
    const fineAmount = parseInt(violation.fine.replace(/[^0-9]/g, ''), 10);
    return sum + (isNaN(fineAmount) ? 0 : fineAmount);
  }, 0) ?? 0; // Default to 0 if violations is null

  const violationCount = violations?.length ?? 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Fines Collected</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-24 mb-1" />
            <Skeleton className="h-4 w-40" />
          </>
        ) : error ? (
          <p className="text-sm text-destructive">Error: {error}</p>
        ) : (
          <>
            <div className="text-2xl font-bold">${totalFines.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
                from {violationCount} violation{violationCount !== 1 ? 's' : ''} recorded
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
