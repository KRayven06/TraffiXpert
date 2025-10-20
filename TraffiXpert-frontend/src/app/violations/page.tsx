import { FineCollection } from "@/components/pages/violations/fine-collection";
import { RecentViolationsLog } from "@/components/pages/violations/recent-violations-log";
import { CameraMonitoring } from "@/components/pages/violations/camera-monitoring";

export default function ViolationsPage() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2">
        <RecentViolationsLog />
      </div>
      <div className="xl:col-span-1 grid gap-6 auto-rows-min">
        <FineCollection />
        <CameraMonitoring />
      </div>
    </div>
  );
}
