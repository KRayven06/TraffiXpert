import { FineCollection } from "@/components/pages/violations/fine-collection";
import { RecentViolationsLog } from "@/components/pages/violations/recent-violations-log";
import { CameraMonitoring } from "@/components/pages/violations/camera-monitoring";

export default function ViolationsPage() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* On Mobile: Order 2 (Bottom). On Desktop: Order 1 (Left) */}
      <div className="xl:col-span-2 order-2 xl:order-1">
        <RecentViolationsLog />
      </div>
      {/* On Mobile: Order 1 (Top). On Desktop: Order 2 (Right) */}
      <div className="xl:col-span-1 grid gap-6 auto-rows-min order-1 xl:order-2">
        <FineCollection />
        {/* Hide CameraMonitoring on mobile */}
        <div className="hidden md:block">
            <CameraMonitoring />
        </div>
      </div>
    </div>
  );
}
