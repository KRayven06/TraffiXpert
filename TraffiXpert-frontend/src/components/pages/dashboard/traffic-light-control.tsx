"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Ban, Siren, Play, Pause } from "lucide-react";
// Remove useSimulation hook
// import { useSimulation } from "@/context/SimulationContext";
import { useToast } from "@/hooks/use-toast"; // Keep useToast
import { useState, useEffect } from "react"; // Add useState, useEffect

// Base URL for your Spring Boot backend API
const API_BASE_URL = 'http://localhost:8080/api';

export function TrafficLightControl() {
  // We no longer get these directly from context
  // const { simulation, isAutoMode, toggleAutoMode, triggerEmergency, isRunning, start, stop } = useSimulation();

  // State to track auto mode (fetched or assumed initially)
  // We might need an endpoint to GET the current mode, but for now, let's assume it starts as true
  // or manage it locally based on button clicks (less robust)
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [isSimulating, setIsSimulating] = useState(true); // Assuming simulation starts running
  const [isSubmitting, setIsSubmitting] = useState(false); // To disable buttons during API calls

  const { toast } = useToast();

  // Function to make API POST requests
  const sendControlCommand = async (endpoint: string, successMessage: string, errorMessage: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        // Headers might be needed later if auth changes (e.g., sending a token)
        // headers: { 'Authorization': 'Bearer YOUR_TOKEN_HERE' }
      });

      if (!response.ok) {
        throw new Error(`Failed: ${response.status} ${response.statusText}`);
      }

      toast({ title: "Success", description: successMessage });

      // Update local state based on action (simple approach)
      if (endpoint === '/control/mode/toggle') {
        setIsAutoMode(prev => !prev);
      }
      if (endpoint === '/control/stop') {
        setIsAutoMode(false); // Stop all implies manual mode
      }

    } catch (error) {
      console.error(`Error sending command to ${endpoint}:`, error);
      toast({ variant: "destructive", title: "Error", description: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };


  // Define handlers using the sendControlCommand function
  const handleToggleAutoMode = () => {
    sendControlCommand(
        '/control/mode/toggle',
        `Switched to ${isAutoMode ? 'Manual' : 'Auto'} mode.`, // Message reflects the change that will happen
        'Failed to toggle auto mode.'
    );
  };

  const handleStopAll = () => {
    sendControlCommand(
        '/control/stop',
        'All traffic signals set to RED.',
        'Failed to stop traffic.'
    );
  };

  const handleTriggerEmergency = () => {
    sendControlCommand(
        '/control/emergency/trigger',
        'Emergency sequence triggered.',
        'Failed to trigger emergency.'
    );
  };

   // TODO: Add backend endpoints for Play/Pause simulation if needed
   // For now, these buttons won't do anything functional with the backend.
   const handleToggleSimulation = () => {
        setIsSimulating(prev => !prev); // Just toggle local state for UI feedback
        toast({ title: "Info", description: "Play/Pause control needs backend implementation." });
   }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="font-headline text-lg">System Control</CardTitle>
            <CardDescription>Mode select & emergency override.</CardDescription>
        </div>
        {/* Play/Pause button - currently only local UI state */}
        <Button onClick={handleToggleSimulation} size="icon" variant="outline" disabled={isSubmitting}>
            {isSimulating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span className="sr-only">{isSimulating ? 'Pause Simulation (UI Only)' : 'Play Simulation (UI Only)'}</span>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col space-y-2">
        {/* Toggle Auto Mode Button */}
        <Button onClick={handleToggleAutoMode} variant={isAutoMode ? "default" : "outline"} disabled={isSubmitting}>
          <Bot className="mr-2 h-4 w-4" />
          {isAutoMode ? "Auto Mode Active" : "Switch to Auto"}
        </Button>
        {/* Stop All Button */}
        <Button onClick={handleStopAll} variant="destructive" disabled={isSubmitting}>
            <Ban className="mr-2 h-4 w-4" />
            Stop All
        </Button>
        {/* Trigger Emergency Button */}
        <Button onClick={handleTriggerEmergency} disabled={isSubmitting}>
          <Siren className="mr-2 h-4 w-4" /> Trigger Emergency
        </Button>
      </CardContent>
    </Card>
  );
}
