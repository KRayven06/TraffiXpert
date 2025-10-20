import { PerformanceMetrics } from "@/components/pages/analytics/performance-metrics";
import { TrafficTrends } from "@/components/pages/analytics/traffic-trends";
import { CongestionHeatmap } from "@/components/pages/analytics/congestion-heatmap";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
        <PerformanceMetrics />
        <TrafficTrends />
      </div>
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
        <CongestionHeatmap />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Key Insights</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold font-headline">15% Traffic Flow Improvement</div>
            <p className="text-xs text-muted-foreground">
              Signal optimization has reduced average wait times during peak hours.
            </p>
            <div className="text-lg font-bold font-headline mt-4">High Violation Zone</div>
            <p className="text-xs text-muted-foreground">
              Eastbound approach shows a high number of red-light violations between 4-6 PM.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
