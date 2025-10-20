import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Cpu, List, CircleDot, Users, Bot, Waypoints } from "lucide-react";

const principles = [
    {
        icon: List,
        title: "Queue: First-In, First-Out (FIFO)",
        description: "Vehicles are processed in the order they arrive at the intersection. This ensures fairness and prevents starvation, where a vehicle could wait indefinitely.",
        details: "Our system uses a standard queue to manage lanes of traffic. As cars approach, they are added to the back of the queue. The traffic signal serves the vehicle at the front of the queue."
    },
    {
        icon: CircleDot,
        title: "Circular Queue: Fair Signal Rotation",
        description: "Manages the rotation of traffic signals in a continuous, looping cycle. This ensures each direction gets a turn in a predictable and efficient manner.",
        details: "The signal phases (North-South Green, East-West Green, etc.) are stored in a circular queue. The system cycles through them, ensuring a smooth and continuous flow of traffic management without needing to reset a linear sequence."
    },
    {
        icon: Users,
        title: "Priority Queue: Emergency Vehicle Management",
        description: "Allows emergency vehicles (police, ambulance, fire trucks) to bypass regular traffic flow. This is critical for reducing response times.",
        details: "When an emergency vehicle is detected, it is inserted into a priority queue. This data structure ensures that it is processed before any non-emergency vehicles, triggering the system to clear its path immediately."
    },
    {
        icon: Waypoints,
        title: "Linked List: Dynamic Vehicle Flow",
        description: "Represents the flow of vehicles in a lane. Linked lists are highly efficient for adding or removing vehicles, mirroring real-world traffic dynamics.",
        details: "Each lane is modeled as a linked list, where each vehicle is a node. This allows for dynamic and efficient management of cars entering and leaving the intersection simulation without requiring large, fixed-size data structures."
    },
];

export default function HowItWorksPage() {
  return (
    <div className="space-y-6">
      <Card className="bg-primary/10">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">The Problem Statement</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">
            Urban traffic congestion is a major challenge, leading to increased travel time, fuel consumption, and pollution. Traditional traffic light systems operate on fixed timers, which are often inefficient as they don't adapt to real-time traffic conditions. This leads to unnecessary waiting, long queues, and a frustrating experience for drivers.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold font-headline">Algorithmic Solution</h2>
        <p className="text-muted-foreground">Our system leverages fundamental data structures to create an intelligent and adaptive traffic management model.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {principles.map((p) => (
          <Card key={p.title}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 p-3 rounded-full">
                    <p.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="font-headline">{p.title}</CardTitle>
                  <CardDescription>{p.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{p.details}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="bg-accent/20 p-3 rounded-full">
                <Bot className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
                <CardTitle className="font-headline text-2xl">Future Scope</CardTitle>
                <CardDescription>Integrating advanced technologies for a smarter tomorrow.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">AI & Machine Learning</h3>
            <p className="text-sm text-muted-foreground">
              Integrate predictive models to forecast traffic flow based on historical data, weather, and local events. Use AI for advanced violation detection and automated incident reporting.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">IoT Integration</h3>
            <p className="text-sm text-muted-foreground">
              Connect with vehicle-to-infrastructure (V2I) communication systems. Cars can directly signal their presence and intent, allowing for even more granular traffic control.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Autonomous Vehicles</h3>
            <p className="text-sm text-muted-foreground">
              As autonomous vehicles become more common, the system can communicate with them directly to coordinate movements, creating highly efficient, platoon-based traffic flow through intersections.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
