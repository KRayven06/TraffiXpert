"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Ban, Siren, Play, Pause, Loader2 } from "lucide-react"; // Added Loader2
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

// Base URL for your Spring Boot backend API
const API_BASE_URL = 'http://localhost:8080/api';

export function TrafficLightControl() {
    const [isAutoMode, setIsAutoMode] = useState(true); // Assuming true initially
    const [isSimulating, setIsSimulating] = useState(true); // Assuming true initially
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingStatus, setIsLoadingStatus] = useState(true); // For initial status fetch

    const { toast } = useToast();

    // Fetch initial simulation status on component mount
    useEffect(() => {
        const fetchInitialStatus = async () => {
            setIsLoadingStatus(true);
            try {
                // Fetch auto mode status (assuming an endpoint exists or default to true)
                // For now, we only fetch running status.
                 const response = await fetch(`${API_BASE_URL}/control/status`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch status: ${response.status}`);
                }
                const data: { isRunning: boolean } = await response.json();
                setIsSimulating(data.isRunning);
                // Fetch isAutoMode status if endpoint exists, otherwise keep initial assumption
                // For now, isAutoMode is only managed by toggle button clicks.

            } catch (error) {
                console.error("Error fetching initial control status:", error);
                // Keep default values on error
            } finally {
                setIsLoadingStatus(false);
            }
        };
        fetchInitialStatus();
    }, []); // Empty dependency array means run once on mount


    // Function to make API POST requests
    const sendControlCommand = async (endpoint: string, successMessage: string, errorMessage: string, updateState?: () => void) => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
            });

            if (!response.ok) {
                 let errorDetails = `Status: ${response.status}`;
                 try { const errorJson = await response.json(); errorDetails = errorJson.message || JSON.stringify(errorJson); } catch (e) { /* Ignore */ }
                throw new Error(`Failed: ${errorDetails}`);
            }

            toast({ title: "Success", description: successMessage });

            // Update local state if provided
            if (updateState) {
                updateState();
            }

        } catch (error: any) {
            console.error(`Error sending command to ${endpoint}:`, error);
            toast({ variant: "destructive", title: "Error", description: error.message || errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleToggleAutoMode = () => {
        const nextMode = !isAutoMode;
        sendControlCommand(
            '/control/mode/toggle',
            `Switched to ${nextMode ? 'Auto' : 'Manual'} mode.`,
            'Failed to toggle auto mode.',
            () => setIsAutoMode(nextMode) // Update state on success
        );
    };

    const handleStopAll = () => {
        sendControlCommand(
            '/control/stop',
            'All traffic signals set to RED.',
            'Failed to stop traffic.'
            // No direct state update needed here unless stop implies pause
        );
    };

    const handleTriggerEmergency = () => {
        sendControlCommand(
            '/control/emergency/trigger',
            'Emergency sequence triggered.',
            'Failed to trigger emergency.'
            // Consider setting isAutoMode to false if backend doesn't handle it
        );
    };

    // --- UPDATED: Connect Play/Pause to backend ---
    const handleToggleSimulation = () => {
        const nextIsSimulating = !isSimulating;
        const endpoint = nextIsSimulating ? '/control/start' : '/control/stop-simulation';
        const successMsg = `Simulation ${nextIsSimulating ? 'resumed' : 'paused'}.`;
        const errorMsg = `Failed to ${nextIsSimulating ? 'resume' : 'pause'} simulation.`;

        sendControlCommand(
            endpoint,
            successMsg,
            errorMsg,
            () => setIsSimulating(nextIsSimulating) // Update state on success
        );
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="font-headline text-lg">System Control</CardTitle>
                    <CardDescription>Mode select & emergency override.</CardDescription>
                </div>
                {/* Play/Pause button */}
                <Button onClick={handleToggleSimulation} size="icon" variant="outline" disabled={isSubmitting || isLoadingStatus}>
                    {isLoadingStatus ? <Loader2 className="h-4 w-4 animate-spin"/> :
                     isSubmitting ? <Loader2 className="h-4 w-4 animate-spin"/> :
                     isSimulating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />
                    }
                    <span className="sr-only">{isSimulating ? 'Pause Simulation' : 'Play Simulation'}</span>
                </Button>
            </CardHeader>
            <CardContent className="flex flex-col space-y-2">
                {/* Toggle Auto Mode Button */}
                <Button onClick={handleToggleAutoMode} variant={isAutoMode ? "default" : "outline"} disabled={isSubmitting || isLoadingStatus}>
                  {isSubmitting && isAutoMode == isAutoMode /* only show spinner if this button caused it */ ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                  {isAutoMode ? "Auto Mode Active" : "Switch to Auto"}
                </Button>
                {/* Stop All Button */}
                <Button onClick={handleStopAll} variant="destructive" disabled={isSubmitting || isLoadingStatus}>
                    {isSubmitting /* consider specific loading state per button */ ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ban className="mr-2 h-4 w-4" />}
                    Stop All Signals
                </Button>
                {/* Trigger Emergency Button */}
                <Button onClick={handleTriggerEmergency} disabled={isSubmitting || isLoadingStatus}>
                    {isSubmitting /* consider specific loading state per button */ ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Siren className="mr-2 h-4 w-4" />}
                     Trigger Emergency
                </Button>
            </CardContent>
        </Card>
    );
}