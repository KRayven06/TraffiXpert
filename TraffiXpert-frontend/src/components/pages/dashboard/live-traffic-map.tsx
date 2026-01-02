// File: krayven06/traffixpert/TraffiXpert-3ff5689eff3414f7133dca39e2e9afd8b7261a64/TraffiXpert-frontend/src/components/pages/dashboard/live-traffic-map.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE_URL } from "@/lib/config";

// --- Type Definitions (same as before) ---
type SignalState = "GREEN" | "YELLOW" | "RED";
type VehicleType = "NORMAL" | "EMERGENCY";
type VehicleColor = 'BLUE' | 'RED' | 'PURPLE' | 'YELLOW' | 'INDIGO' | 'PINK' | 'GREEN' | 'WHITE';

interface TrafficSignalDTO {
  state: SignalState;
}

interface VehicleDTO {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  color: VehicleColor;
  type: VehicleType;
}

interface SimulationStateDTO {
  signals: TrafficSignalDTO[];
  vehicles: VehicleDTO[];
}
// --- End Type Definitions ---

// --- Helper Components (TrafficLight, Car - mostly same, Car now takes interpolated props) ---
const LightColorMap: Record<SignalState, "green" | "yellow" | "red"> = {
  GREEN: "green",
  YELLOW: "yellow",
  RED: "red",
};

const TrafficLight = ({ color, rotation = 0 }: { color: "green" | "yellow" | "red"; rotation?: number }) => {
  const lightClasses = "w-3 h-3 rounded-full transition-all";
  const lightColorClass = {
    red: "bg-red-500 shadow-[0_0_8px_2px_theme(colors.red.500)]",
    yellow: "bg-yellow-400 shadow-[0_0_8px_2px_theme(colors.yellow.400)]",
    green: "bg-green-500 shadow-[0_0_8px_2px_theme(colors.green.500)]",
    off: "bg-gray-600/50",
  };
  return (
    <div className="flex flex-col items-center" style={{ transform: `rotate(${rotation}deg)`}}>
        <div className={cn("flex flex-col space-y-1 rounded p-1 bg-gray-900 border border-gray-700/80 shadow-md")}>
            <div className={cn(lightClasses, color === 'red' ? lightColorClass.red : lightColorClass.off)} />
            <div className={cn(lightClasses, color === 'yellow' ? lightColorClass.yellow : lightColorClass.off)} />
            <div className={cn(lightClasses, color === 'green' ? lightColorClass.green : lightColorClass.off)} />
        </div>
        <div className="w-1 h-2 bg-gray-700/80" />
    </div>
  );
};

const carColorMap: Record<VehicleColor, string> = {
    BLUE: 'bg-blue-500', RED: 'bg-red-500', PURPLE: 'bg-purple-500',
    YELLOW: 'bg-yellow-500', INDIGO: 'bg-indigo-500', PINK: 'bg-pink-500',
    GREEN: 'bg-green-500', WHITE: 'bg-white border-2 border-red-500'
};

// Car component now receives interpolated position and angle
interface InterpolatedVehicleProps {
  id: number;
  x: number; // Interpolated X
  y: number; // Interpolated Y
  width: number;
  height: number;
  angle: number; // Interpolated Angle
  color: VehicleColor;
  type: VehicleType;
}

const Car = React.memo(({ vehicle }: { vehicle: InterpolatedVehicleProps }) => {
    const { x, y, width, height, angle, color, type } = vehicle;
    return (
        <div
          className={cn(
              "absolute rounded-t-sm shadow-md",
              carColorMap[color],
              type === 'EMERGENCY' && 'animate-pulse z-10'
          )}
          style={{
            // Convert 400x400 coordinate system to percentages
            left: `${(x / 400) * 100}%`, 
            top: `${(y / 400) * 100}%`, 
            width: `${(width / 400) * 100}%`, 
            height: `${(height / 400) * 100}%`,
            transform: `rotate(${angle}deg)`, 
            transformOrigin: 'center center',
          }}
        >
          <div className="absolute top-[10%] left-[10%] w-[30%] h-[20%] bg-gray-900/20 rounded-sm" />
          <div className="absolute top-[10%] right-[10%] w-[30%] h-[20%] bg-gray-900/20 rounded-sm" />
          {type === 'EMERGENCY' && (
              <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[30%] h-[20%] rounded-full bg-blue-500 animate-pulse" />
          )}
        </div>
    );
});
Car.displayName = 'Car'; // Add display name for React DevTools


// --- Interpolation Logic ---
const FETCH_INTERVAL = 300; // ms - Increased base interpolation window for smoother animation over network

// Linear interpolation function
function lerp(start: number, end: number, t: number): number {
  // Clamp t between 0 and 1
  const clampedT = Math.max(0, Math.min(1, t));
  return start * (1 - clampedT) + end * clampedT;
}

// Angle interpolation (handles wrapping around 360 degrees)
function lerpAngle(start: number, end: number, t: number): number {
    const clampedT = Math.max(0, Math.min(1, t));
    const delta = ((end - start + 180) % 360) - 180; // Shortest angle difference (-180 to 180)
    return (start + delta * clampedT + 360) % 360; // Add delta * t to start, wrap around 360
}

// --- Main Component ---
export function LiveTrafficMap() {
  // State for raw data from backend
  const [latestState, setLatestState] = useState<SimulationStateDTO | null>(null);
  const previousStateRef = useRef<SimulationStateDTO | null>(null); // Store previous state
  const lastUpdateTimeRef = useRef<number>(0); // Timestamp of last backend update

  // State for interpolated values used for rendering
  const [interpolatedVehicles, setInterpolatedVehicles] = useState<InterpolatedVehicleProps[]>([]);
  const [currentSignals, setCurrentSignals] = useState<TrafficSignalDTO[]>([]); // Signals don't need interpolation

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref for the animation frame loop
  const animationFrameRef = useRef<number>();

  // Fetching Logic (runs on interval)
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const fetchData = async () => {
      try {
        const fetchStart = performance.now();
        const response = await fetch(`${API_BASE_URL}/simulation/state`);
        
        if (!isMounted) return; // Stop if unmounted

        if (!response.ok) {
           setError(`Failed to fetch state: ${response.status}`);
           // If error, retry after a longer delay
           timeoutId = setTimeout(fetchData, 2000); 
           return;
        }
        const data: SimulationStateDTO = await response.json();

        // Calculate actual network latency to adjust interpolation
        const now = performance.now();
        const latency = now - fetchStart;
        
        // Dynamic fetch interval based on latency (aim for 200ms or latency + 50ms)
        // This ensures checking frequently but not overlapping requests
        const nextDelay = Math.max(50, 200 - latency);

        // Store current latestState as the previous state *before* updating
        // Note: In this closure, 'latestState' refers to the state at the time the effect ran.
        // We actually need the *current* state. 
        // Best approach for recursive fetch is to rely on refs for state tracking in animate loop,
        // OR rely on React state updates.
        // Simplified: Just update state. previousState logic is handled in 'previousStateRef.current = latestState' 
        // BUT 'latestState' is stale here if we don't include it in dep array working with setInterval.
        // With recursive setTimeout, we are always in a closure. 
        
        // Fix: Update ref BEFORE setting new state.
        // Since we can't easily get "current" state in this async closure without refs, 
        // we'll optimistically set it.
        // Actually, previousStateRef is updated in the effect dependency or we can manually update it here
        // if we have access to the *real* latest state.
        // A better pattern for interpolation is updating refs directly for the loop.
        
        setLatestState((prevState) => {
            previousStateRef.current = prevState; // Capture what was essentially "current" before this update
            return data;
        });

        // Record the time we received this update
        lastUpdateTimeRef.current = now;
        // Update signals directly (no interpolation needed)
        setCurrentSignals(data.signals);

        setError(null);

        // Schedule next fetch
        timeoutId = setTimeout(fetchData, nextDelay);

      } catch (err) {
        console.error("Error fetching simulation state:", err);
        setError("Could not connect to backend.");
        // Retry logic on connection failure
        timeoutId = setTimeout(fetchData, 5000);
      } finally {
        if (isMounted && isLoading) setIsLoading(false);
      }
    };

    fetchData(); // Initial fetch

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []); // Empty dependency array - fetchData is recursive and self-contained now.


  // Animation Loop Logic (runs every frame)
  const animate = useCallback(() => {
    if (!latestState) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return; // Don't animate if we have no data yet
    }

    const now = performance.now();
    const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
    // Interpolation factor (t): how far are we between the last update and the expected next one?
    const t = Math.min(timeSinceLastUpdate / FETCH_INTERVAL, 1.0); // Clamp at 1.0

    const prevVehiclesMap = new Map(previousStateRef.current?.vehicles.map(v => [v.id, v]));

    const newInterpolatedVehicles = latestState.vehicles.map(currentVehicle => {
      const prevVehicle = prevVehiclesMap.get(currentVehicle.id);

      // If we don't have previous data for this vehicle (it just appeared),
      // or if interpolation doesn't make sense (e.g. teleported), use current state.
      if (!prevVehicle) {
          return { ...currentVehicle }; // Use current data directly
      }

      // Calculate interpolated values
      const interpolatedX = lerp(prevVehicle.x, currentVehicle.x, t);
      const interpolatedY = lerp(prevVehicle.y, currentVehicle.y, t);
      const interpolatedAngle = lerpAngle(prevVehicle.angle, currentVehicle.angle, t);

      return {
        ...currentVehicle, // Keep id, width, height, color, type from current
        x: interpolatedX,
        y: interpolatedY,
        angle: interpolatedAngle,
      };
    });

    setInterpolatedVehicles(newInterpolatedVehicles);

    // Continue the loop
    animationFrameRef.current = requestAnimationFrame(animate);

  }, [latestState]); // Rerun animate function setup if latestState changes

  // Start/Stop the animation loop
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animate);
    // Cleanup function to stop the loop when component unmounts
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate]); // Restart loop if animate function itself changes (due to dependencies)


  // --- Render Logic ---
   if (isLoading) { /* ... Loading state ... */
     return (
       <Card className="overflow-hidden h-full">
         <CardContent className="p-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800 h-full min-h-[300px]">
             <div className="text-muted-foreground">Loading Map...</div>
         </CardContent>
       </Card>
     );
   }
  if (error) { /* ... Error state ... */
       return (
       <Card className="overflow-hidden h-full border-destructive">
         <CardContent className="p-4 flex flex-col items-center justify-center bg-destructive/10 h-full min-h-[300px]">
             <p className="text-destructive font-semibold">Map Error</p>
             <p className="text-destructive/80 text-sm text-center">{error}</p>
         </CardContent>
       </Card>
     );
  }
   if (!latestState) { /* ... Waiting for data state ... */
    return (
      <Card className="overflow-hidden h-full">
        <CardContent className="p-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800 h-full min-h-[300px]">
            <div className="text-muted-foreground">Waiting for simulation data...</div>
        </CardContent>
      </Card>
    );
  }

  // Use currentSignals and interpolatedVehicles for rendering
  const signals = currentSignals;
  const vehicles = interpolatedVehicles;

  // INCREASED OFFSET VALUE for signal positioning
  const signalOffset = '16.25%'; // 65px / 400px = 16.25%

  return (
    <Card className="overflow-hidden h-full">
      <CardContent className="p-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800 h-full">
        {/* Responsive Container: w-full, aspect-square, max-width to not get too huge */}
        <div className="relative w-full max-w-[500px] aspect-square bg-gray-400 dark:bg-gray-600 overflow-hidden mx-auto">
          {/* Roads, Markings - Using Percentages */}
          <div className="absolute top-1/2 left-0 w-full h-[20%] bg-gray-700 dark:bg-gray-900 -translate-y-1/2" /> {/* 20px/400px is 5%, but road is wider usually. Assuming 80px road -> 20% */}
          <div className="absolute left-1/2 top-0 h-full w-[20%] bg-gray-700 dark:bg-gray-900 -translate-x-1/2" />
          
          {/* Dashed Lines */}
          <div className="absolute top-1/2 left-0 w-[40%] h-[0.5%] border-b-[3px] border-dashed border-gray-500" />
          <div className="absolute top-1/2 right-0 w-[40%] h-[0.5%] border-b-[3px] border-dashed border-gray-500" />
          <div className="absolute left-1/2 top-0 h-[40%] w-[0.5%] border-l-[3px] border-dashed border-gray-500" />
          <div className="absolute left-1/2 bottom-0 h-[40%] w-[0.5%] border-l-[3px] border-dashed border-gray-500" />

          {/* Traffic Lights (use currentSignals) - Positioned with Percentages */}
          {signals.length >= 4 && (
              <>
                {/* Northbound (Bottom Right) */}
                <div className="absolute top-[calc(50%+var(--offset))] left-[calc(50%+var(--offset))] -translate-x-1/2 -translate-y-1/2" style={{ '--offset': signalOffset } as React.CSSProperties}>
                    <TrafficLight color={LightColorMap[signals[0].state]} rotation={180} />
                </div>
                 {/* Westbound (Top Right) */}
                 <div className="absolute top-[calc(50%-var(--offset))] left-[calc(50%+var(--offset))] -translate-x-1/2 -translate-y-1/2" style={{ '--offset': signalOffset } as React.CSSProperties}>
                    <TrafficLight color={LightColorMap[signals[3].state]} rotation={90} />
                </div>
                 {/* Southbound (Top Left) */}
                 <div className="absolute top-[calc(50%-var(--offset))] left-[calc(50%-var(--offset))] -translate-x-1/2 -translate-y-1/2" style={{ '--offset': signalOffset } as React.CSSProperties}>
                    <TrafficLight color={LightColorMap[signals[1].state]} rotation={0} />
                 </div>
                 {/* Eastbound (Bottom Left) */}
                 <div className="absolute top-[calc(50%+var(--offset))] left-[calc(50%-var(--offset))] -translate-x-1/2 -translate-y-1/2" style={{ '--offset': signalOffset } as React.CSSProperties}>
                    <TrafficLight color={LightColorMap[signals[2].state]} rotation={-90} />
                 </div>
              </>
          )}

          {/* Cars (use interpolatedVehicles) */}
          <div className="absolute inset-0">
             {vehicles.map((v) => (
                <Car key={v.id} vehicle={v} />
            ))}
          </div>

        </div>
      </CardContent>
    </Card>
  );
}