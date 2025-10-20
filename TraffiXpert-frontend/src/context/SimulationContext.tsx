
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { Simulation, type Violation, type EmergencyEvent, type Stats } from '@/lib/simulation-engine';

interface SimulationContextType {
  simulation: Simulation | null;
  isRunning: boolean;
  isAutoMode: boolean;
  stats: Stats;
  violations: Violation[];
  emergencyEvents: EmergencyEvent[];
  start: () => void;
  stop: () => void;
  toggleAutoMode: () => void;
  triggerEmergency: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider = ({ children }: { children: ReactNode }) => {
  const [simulation] = useState<Simulation>(() => new Simulation());
  const [isRunning, setIsRunning] = useState(false);
  const animationFrameId = useRef<number>();

  const [stats, setStats] = useState<Stats>(simulation.getStats());
  const [violations, setViolations] = useState<Violation[]>([]);
  const [emergencyEvents, setEmergencyEvents] = useState<EmergencyEvent[]>([]);


  const loop = useCallback(() => {
    simulation.update();
    setStats(simulation.getStats());
    setViolations([...simulation.violations]);
    setEmergencyEvents([...simulation.emergencyLog]);
    animationFrameId.current = requestAnimationFrame(loop);
  }, [simulation]);

  const start = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      animationFrameId.current = requestAnimationFrame(loop);
    }
  }, [isRunning, loop]);

  const stop = useCallback(() => {
    if (isRunning && animationFrameId.current) {
      setIsRunning(false);
      cancelAnimationFrame(animationFrameId.current);
    }
  }, [isRunning]);

  const toggleAutoMode = useCallback(() => {
    simulation.toggleAutoMode();
    setStats(simulation.getStats()); // Force an update to show new mode
  }, [simulation]);
  
  const triggerEmergency = useCallback(() => {
    simulation.triggerEmergency();
  }, [simulation]);


  useEffect(() => {
    return () => {
        if(animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
    }
  }, []);

  const contextValue = {
    simulation,
    isRunning,
    isAutoMode: simulation.isAutoMode,
    stats,
    violations,
    emergencyEvents,
    start,
    stop,
    toggleAutoMode,
    triggerEmergency,
  };

  return (
    <SimulationContext.Provider value={contextValue}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
