
"use client"

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Siren, Timer, Zap } from "lucide-react"
import { useSimulation } from "@/context/SimulationContext"

export function EmergencyControls() {
  const { triggerEmergency, stats } = useSimulation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg">Emergency Simulation</CardTitle>
        <CardDescription>
          Statistics on emergency vehicle response times and path clearance.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                <Timer className="h-8 w-8 text-primary"/>
                <div>
                    <p className="text-sm text-muted-foreground">Avg. Response Time</p>
                    <p className="text-2xl font-bold">{stats.avgEmergencyResponse.toFixed(1)}s</p>
                </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                <Zap className="h-8 w-8 text-primary"/>
                <div>
                    <p className="text-sm text-muted-foreground">Last Clearance</p>
                    <p className="text-2xl font-bold">{stats.lastEmergencyClearance?.toFixed(1) ?? 'N/A'}s</p>
                </div>
            </div>
      </CardContent>
    </Card>
  )
}
