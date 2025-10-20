import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

const statuses = [
  { name: "Intersection Sensors", status: "online" },
  { name: "AI Violation Detection", status: "online" },
  { name: "Emergency Response", status: "ready" },
  { name: "Signal Controller", status: "online" },
];

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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg">System Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {statuses.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{item.name}</span>
            <div className="flex items-center gap-2 font-medium">
              {statusIcons[item.status as keyof typeof statusIcons]}
              <span>{statusText[item.status as keyof typeof statusText]}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
