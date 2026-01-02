// File: src/components/pages/dashboard/system-status.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import useSWR from "swr";
import { API_BASE_URL } from "@/lib/config";

// Interface must match the backend SystemHealthDTO
interface SystemHealthDTO {
    overallStatus: string;
    components: Record<string, string>;
}

const statusIcons = {
  online: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  ready: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  offline: <XCircle className="h-4 w-4 text-red-500" />,
  degraded: <AlertCircle className="h-4 w-4 text-yellow-500" />,
};

const statusText = {
  online: "Online",
  ready: "Ready",
  offline: "Offline",
  degraded: "Degraded"
}

export function SystemStatus() {
  const { data, error, isLoading } = useSWR<SystemHealthDTO>(`${API_BASE_URL}/system/health`, async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch health status");
      return res.json();
  }, { refreshInterval: 10000 }); // Check every 10 seconds

  // Default fallback if loading or error (optional, but good for UX)
  const components = data?.components || {
      "Simulation Engine": "unknown",
      "Database Connection": "unknown",
      "AI Violation Detection": "unknown",
      "Intersection Sensors": "unknown"
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg">System Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && !data ? (
            <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        ) : (
            Object.entries(components).map(([name, status]) => {
                // Normalize status to lowercase for mapping
                const normalizedStatus = status.toLowerCase() as keyof typeof statusIcons;
                return (
                  <div key={name} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{name}</span>
                    <div className="flex items-center gap-2 font-medium">
                      {statusIcons[normalizedStatus] || <AlertCircle className="h-4 w-4 text-gray-400" />}
                      <span className="capitalize">{normalizedStatus}</span>
                    </div>
                  </div>
                );
            })
        )}
        {error && (
            <div className="text-destructive text-sm text-center">
                System Unreachable
            </div>
        )}
      </CardContent>
    </Card>
  );
}

