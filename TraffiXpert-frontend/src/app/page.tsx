"use client";

import { LiveTrafficMap } from "@/components/pages/dashboard/live-traffic-map";
import { TrafficLightControl } from "@/components/pages/dashboard/traffic-light-control";
import { SystemStatus } from "@/components/pages/dashboard/system-status";
import { LiveTrafficStats } from "@/components/pages/dashboard/live-traffic-stats";
import { TodaySummary } from "@/components/pages/dashboard/today-summary";
import { CurrentConditions } from "@/components/pages/dashboard/current-conditions";
// Remove useSimulation import
// import { useSimulation } from "@/context/SimulationContext";
import { Button } from "@/components/ui/button";
import { FileText, Activity, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react"; // Removed useEffect, kept useState
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
// Remove AI flow import
// import { generateDailyReport, GenerateDailyReportOutput } from "@/ai/flows/generate-daily-report";
import { ReportDialog } from "@/components/pages/dashboard/report-dialog";

// --- Define Types matching Backend API responses ---
// Type for Stats (matches SimulationService.Stats record structure)
interface StatsDTO {
    totalVehicles: number;
    avgWaitTime: number; // In seconds
    vehiclesByDirection: { NORTH: number, SOUTH: number, EAST: number, WEST: number };
    avgEmergencyResponse: number; // In seconds
    lastEmergencyClearance: number | null; // In seconds
}

// Type for Violation (matches Violation model)
interface ViolationDTO {
    id: string;
    time: string; // Assuming time comes as formatted string
    location: string;
    type: string;
    fine: string;
}

// Type matching GenerateDailyReportOutputSchema from original flow
// We expect the backend endpoint to return this structure
interface GenerateDailyReportOutputDTO {
  summary: string;
  recommendations: string[];
}
// --- End Type Definitions ---

// Base URL for your Spring Boot backend API
const API_BASE_URL = 'http://localhost:8080/api';


export default function DashboardPage() {
  // Removed isRunning, start, stats, violations from useSimulation
  const { toast } = useToast();
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [report, setReport] = useState<GenerateDailyReportOutputDTO | null>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  // Removed useEffect that called start()

  const handleRunDiagnostics = () => {
    // This remains a frontend-only action for now
    toast({
      title: "System Diagnostics",
      description: "All systems are running optimally.",
    });
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    setReport(null); // Clear previous report
    try {
      // 1. Fetch current stats and violations from backend
      const [statsResponse, violationsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/stats`),
        fetch(`${API_BASE_URL}/violations`)
      ]);

      if (!statsResponse.ok || !violationsResponse.ok) {
        throw new Error('Failed to fetch necessary data for report.');
      }

      const statsData: StatsDTO = await statsResponse.json();
      const violationsData: ViolationDTO[] = await violationsResponse.json();

      // 2. Prepare input for the backend report generation endpoint
      // Summarize violations (matching the structure needed by the backend endpoint)
      const violationSummary = violationsData.reduce((acc, v) => {
        const existing = acc.find(item => item.type === v.type);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ type: v.type, count: 1 });
        }
        return acc;
      }, [] as { type: string; count: number }[]);

      const reportInput = {
        totalVehicles: statsData.totalVehicles,
        avgWaitTime: statsData.avgWaitTime,
        violations: violationSummary,
      };

      // 3. Call the new backend endpoint (We need to create this endpoint)
      // TODO: Create POST /api/ai/generate-report endpoint in Spring Boot backend
      const reportResponse = await fetch(`${API_BASE_URL}/ai/generate-report`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(reportInput),
      });

      if (!reportResponse.ok) {
          // Try to get error details from backend response if available
          let errorDetails = `Status: ${reportResponse.status}`;
          try {
              const errorJson = await reportResponse.json();
              errorDetails = errorJson.message || JSON.stringify(errorJson);
          } catch (e) { /* Ignore if response is not JSON */ }
          throw new Error(`Report generation failed: ${errorDetails}`);
      }

      const result: GenerateDailyReportOutputDTO = await reportResponse.json();

      setReport(result);
      setIsReportDialogOpen(true);

    } catch (e: any) { // Catch specific error type
      console.error(e);
      toast({
        variant: "destructive",
        title: "Report Generation Failed",
        description: e.message || "Could not generate the traffic report. Please try again."
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="grid gap-6">
      {/* Layout remains the same */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative h-full">
          {/* LiveTrafficMap fetches its own data */}
          <LiveTrafficMap />
        </div>
        <div className="flex flex-col gap-6">
          {/* TrafficLightControl makes its own API calls */}
          <TrafficLightControl />
          <Card>
            <CardHeader>
                <CardTitle className="font-headline text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col space-y-2">
                <Button variant="outline" asChild>
                    <Link href="/violations">
                        <AlertCircle className="mr-2 h-4 w-4 text-primary" /> View Incidents
                    </Link>
                </Button>
                <Button variant="outline" onClick={handleGenerateReport} disabled={isGeneratingReport}>
                    {isGeneratingReport ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <FileText className="mr-2 h-4 w-4 text-primary" />}
                    {isGeneratingReport ? 'Generating...' : 'Generate Report'}
                </Button>
                <Button variant="outline" onClick={handleRunDiagnostics}>
                    <Activity className="mr-2 h-4 w-4 text-primary" /> System Diagnostics
                </Button>
            </CardContent>
          </Card>
        </div>
      </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* These components fetch their own data */}
          <SystemStatus />
          <LiveTrafficStats />
          <TodaySummary />
          <CurrentConditions />
        </div>

      {/* ReportDialog uses the fetched report state */}
      {report && (
        <ReportDialog
            open={isReportDialogOpen}
            onOpenChange={setIsReportDialogOpen}
            report={report} // Pass the DTO structure
        />
      )}
    </div>
  );
}
