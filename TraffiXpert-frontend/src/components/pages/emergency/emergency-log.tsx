
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card"
import { useSimulation } from "@/context/SimulationContext";


export function EmergencyLog() {
  const { emergencyEvents } = useSimulation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg">Emergency Log</CardTitle>
        <CardDescription>
          A log of recent emergency vehicle passages.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event ID</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Vehicle Type</TableHead>
              <TableHead className="text-right">Clearance Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
             {emergencyEvents.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">No emergency events logged yet.</TableCell>
                </TableRow>
            )}
            {emergencyEvents.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.id}</TableCell>
                <TableCell>{event.time}</TableCell>
                <TableCell>{event.type}</TableCell>
                <TableCell className="text-right">{event.clearanceTime.toFixed(1)}s</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
