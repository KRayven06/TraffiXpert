import { EmergencyControls } from "@/components/pages/emergency/emergency-controls";
import { EmergencyLog } from "@/components/pages/emergency/emergency-log";

export default function EmergencyPage() {
  return (
    <div className="grid grid-cols-1 gap-6">
      <EmergencyControls />
      <EmergencyLog />
    </div>
  );
}
