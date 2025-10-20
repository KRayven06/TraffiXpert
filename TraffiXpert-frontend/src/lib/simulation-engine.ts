// --- Type Definitions ---
// These define the structure/shape of data used by the frontend,
// often matching the data received from the backend API.

// --- UPDATED to UPPERCASE ---
export type SignalState = "GREEN" | "YELLOW" | "RED";
export type VehicleType = "NORMAL" | "EMERGENCY";
export type VehicleColor = 'BLUE' | 'RED' | 'PURPLE' | 'YELLOW' | 'INDIGO' | 'PINK' | 'GREEN' | 'WHITE';
export type TurnDirection = "STRAIGHT" | "LEFT" | "RIGHT";
// --- End Update ---


// --- Interface Definitions ---

export interface Violation {
  id: string;
  time: string; // From backend (e.g., "HH:mm:ss")
  location: string;
  type: string;
  fine: string;
}

export interface EmergencyEvent {
    id: string;
    time: string; // From backend (e.g., "HH:mm:ss")
    type: string;
    clearanceTime: number; // From backend (in seconds)
}

// Interface matching the Stats record/DTO from the backend
export interface Stats {
    totalVehicles: number;
    avgWaitTime: number; // In seconds
    vehiclesByDirection: { NORTH: number, SOUTH: number, EAST: number, WEST: number }; // Keys match backend Enum names
    avgEmergencyResponse: number; // In seconds
    lastEmergencyClearance: number | null; // In seconds
}

// Interface for individual vehicle data received from the backend state API
// (Matches VehicleDTO structure used in LiveTrafficMap)
export interface Vehicle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  // --- UPDATED to UPPERCASE ---
  color: 'BLUE' | 'RED' | 'PURPLE' | 'YELLOW' | 'INDIGO' | 'PINK' | 'GREEN' | 'WHITE'; // Match backend Enum names
  type: 'NORMAL' | 'EMERGENCY'; // Match backend Enum names
  // --- End Update ---
  // Other properties like speed, waitTime, turn are managed by backend
  // and might not be needed directly by all frontend components. Add if required.
}

// --- Removed Simulation Logic ---
// Classes Simulation, Road, Vehicle, TrafficSignal and related logic functions
// have been removed as they now reside in the Java Spring Boot backend.