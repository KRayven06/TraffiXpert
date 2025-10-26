/* krayven06/traffixpert/TraffiXpert-92907556fcb20d7c61fc29c88abf5001b4a08109/TraffiXpert-frontend/src/app/(main)/analytics/page.tsx */
import { PerformanceMetrics } from "@/components/pages/analytics/performance-metrics";
import { TrafficTrends } from "@/components/pages/analytics/traffic-trends";
// --- NEW: Import the new metric components ---
import { ViolationMetrics } from "@/components/pages/analytics/ViolationMetrics";
import { EmergencyMetrics } from "@/components/pages/analytics/EmergencyMetrics";

export default function AnalyticsPage() {
  return (
    // Changed main grid to handle multiple rows better
    <div className="grid grid-cols-1 gap-6 auto-rows-min">
      {/* Row 1: Performance and Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PerformanceMetrics />
        <TrafficTrends />
      </div>

      {/* --- NEW: Row 2: Violations and Emergency --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ViolationMetrics />
        <EmergencyMetrics />
      </div>

    </div>
  );
}