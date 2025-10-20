
export type SignalState = "GREEN" | "YELLOW" | "RED";
export type VehicleType = "normal" | "emergency";
export type VehicleColor = 'blue' | 'red' | 'purple' | 'yellow' | 'indigo' | 'pink' | 'green' | 'white';
export type TurnDirection = "straight" | "left" | "right";


const VEHICLE_DIMENSIONS = { width: 10, height: 16 };
const carColors: VehicleColor[] = ['blue', 'red', 'purple', 'yellow', 'indigo', 'pink', 'green'];

export interface Violation {
  id: string;
  time: string;
  location: string;
  type: string;
  fine: string;
}

export interface EmergencyEvent {
    id: string;
    time: string;
    type: string;
    clearanceTime: number;
}

export interface Stats {
    totalVehicles: number;
    avgWaitTime: number;
    vehiclesByDirection: { north: number, south: number, east: number, west: number };
    avgEmergencyResponse: number;
    lastEmergencyClearance: number | null;
}

let vehicleIdCounter = 0;
let violationIdCounter = 0;
let emergencyIdCounter = 0;

class TrafficSignal {
    state: SignalState;
    timer: number;

    constructor() {
        this.state = "RED";
        this.timer = 0;
    }

    changeState(state: SignalState, duration: number) {
        this.state = state;
        this.timer = duration;
    }

    update(deltaTime: number) {
        if (this.timer > 0) {
            this.timer -= deltaTime;
        }
    }
}

export class Vehicle {
    id: number;
    x: number;
    y: number;
    width: number = VEHICLE_DIMENSIONS.width;
    height: number = VEHICLE_DIMENSIONS.height;
    speed: number;
    angle: number;
    road: Road;
    isMoving: boolean;
    color: VehicleColor;
    type: VehicleType;
    waitTime: number;
    turn: TurnDirection;
    isTurning: boolean = false;
    turnAngle: number = 0;
    initialAngle: number;
    destinationAngle: number | null = null;
    totalTurnAngle: number = 0;
    accumulatedTurn: number = 0;


    constructor(road: Road, type: VehicleType = 'normal') {
        this.id = vehicleIdCounter++;
        this.road = road;
        this.x = road.startX;
        this.y = road.startY;
        this.angle = road.angle;
        this.initialAngle = road.angle;
        this.speed = type === 'emergency' ? 0.1 : 0.05 + Math.random() * 0.02;
        this.isMoving = true;
        this.color = type === 'emergency' ? 'white' : carColors[Math.floor(Math.random() * carColors.length)];
        this.type = type;
        this.waitTime = 0;

        const rand = Math.random();
        if (rand < 0.5) this.turn = "straight";
        else if (rand < 0.75) this.turn = "left";
        else this.turn = "right";

    }

    handleTurning(deltaTime: number) {
        const turnBox = { x1: 160, y1: 160, x2: 240, y2: 240 };
        const inTurnBox = this.x > turnBox.x1 && this.x < turnBox.x2 && this.y > turnBox.y1 && this.y < turnBox.y2;
        
        if (this.turn !== "straight" && inTurnBox && !this.isTurning && this.destinationAngle === null) {
            this.isTurning = true;
            
            const turnDirection = this.turn === 'right' ? 1 : -1;
            this.totalTurnAngle = 90 * turnDirection;
            this.destinationAngle = (this.initialAngle + this.totalTurnAngle + 360) % 360;
            this.accumulatedTurn = 0;
        }
        
        if (this.isTurning) {
            const turnRate = 2; // degrees per frame
            const turnDirection = this.totalTurnAngle > 0 ? 1 : -1;
            const turnAmount = turnDirection * turnRate * deltaTime * 0.1;
            
            if (Math.abs(this.accumulatedTurn) < Math.abs(this.totalTurnAngle)) {
                this.angle += turnAmount;
                this.accumulatedTurn += turnAmount;
            } else {
                if (this.destinationAngle !== null) {
                    this.angle = this.destinationAngle;
                }
                this.isTurning = false;
            }
        }
    }


    update(deltaTime: number, signal: SignalState, vehiclesInFront: Vehicle[]) {
        const stopPosition = this.road.stopLine;
        let isStoppedByCar = false;
        
        for (const frontVehicle of vehiclesInFront) {
            const distance = Math.hypot(this.x - frontVehicle.x, this.y - frontVehicle.y);
            if (distance < this.height * 1.5) {
                isStoppedByCar = true;
                break;
            }
        }

        const isApproachingStopLine = (this.road.direction === 'north' && this.y > stopPosition && (this.y - this.speed * deltaTime) <= stopPosition) ||
                                      (this.road.direction === 'south' && this.y < stopPosition && (this.y + this.speed * deltaTime) >= stopPosition) ||
                                      (this.road.direction === 'east' && this.x < stopPosition && (this.x + this.speed * deltaTime) >= stopPosition) ||
                                      (this.road.direction === 'west' && this.x > stopPosition && (this.x - this.speed * deltaTime) <= stopPosition);

        const hasPassedStopLine = (this.road.direction === 'north' && this.y < stopPosition) ||
                                 (this.road.direction === 'south' && this.y > stopPosition) ||
                                 (this.road.direction === 'east' && this.x > stopPosition) ||
                                 (this.road.direction === 'west' && this.x < stopPosition);

        // Stop only if approaching a non-green light and haven't passed the stop line yet.
        if (!hasPassedStopLine && isApproachingStopLine && signal !== 'GREEN' && this.type !== 'emergency') {
            this.isMoving = false;
        } else if (isStoppedByCar) {
             this.isMoving = false;
        } else {
            this.isMoving = true;
        }

        if(!this.isMoving) {
            this.waitTime += deltaTime;
        } else {
            this.waitTime = 0;
        }

        // Red light violation check (only if approaching)
        if (isApproachingStopLine && signal === 'RED' && this.type === 'normal' && Math.random() < 0.0005) {
            this.road.simulation.addViolation(this.road.name);
            this.isMoving = true; // Run the red light
        }


        if (this.isMoving) {
            this.x += Math.sin(this.angle * Math.PI / 180) * this.speed * deltaTime;
            this.y -= Math.cos(this.angle * Math.PI / 180) * this.speed * deltaTime;
        }
        
        // Handle turning only if passed stop line
        if (hasPassedStopLine) {
            this.handleTurning(deltaTime);
        }
    }
}

class Road {
    name: 'north' | 'south' | 'east' | 'west';
    vehicles: Vehicle[] = [];
    spawnTimer: number;
    startX: number;
    startY: number;
    angle: number;
    stopLine: number;
    direction: 'north' | 'south' | 'east' | 'west';
    simulation: Simulation;

    constructor(name: 'north' | 'south' | 'east' | 'west', simulation: Simulation) {
        this.name = name;
        this.simulation = simulation;
        this.spawnTimer = Math.random() * 3000;
        
        switch (name) {
            case 'north':
                this.startX = 215; this.startY = -20; this.angle = 180; this.stopLine = 160; this.direction = 'south';
                break;
            case 'south':
                this.startX = 175; this.startY = 420; this.angle = 0; this.stopLine = 240; this.direction = 'north';
                break;
            case 'east':
                this.startX = 420; this.startY = 215; this.angle = -90; this.stopLine = 240; this.direction = 'west';
                break;
            case 'west':
                this.startX = -20; this.startY = 175; this.angle = 90; this.stopLine = 160; this.direction = 'east';
                break;
        }
    }

    update(deltaTime: number, signal: SignalState) {
        this.spawnTimer -= deltaTime;
        if (this.spawnTimer <= 0) {
            if (this.vehicles.length < 10) { // Limit vehicles per road
                this.vehicles.unshift(new Vehicle(this));
            }
            this.spawnTimer = 4000 + Math.random() * 4000; // spawn every 4-8 seconds
        }

        for (let i = this.vehicles.length - 1; i >= 0; i--) {
            const vehicle = this.vehicles[i];
            const vehiclesInFront = this.vehicles.slice(i + 1);
            vehicle.update(deltaTime, signal, vehiclesInFront);
        }

        // Remove vehicles that are off-screen
        const initialCount = this.vehicles.length;
        this.vehicles = this.vehicles.filter(v => v.x > -30 && v.x < 430 && v.y > -30 && v.y < 430);
        const finalCount = this.vehicles.length;
        this.simulation.totalVehicleCount += initialCount - finalCount;
    }
}


export class Simulation {
    signals: TrafficSignal[];
    roads: Road[];
    isAutoMode: boolean;
    autoModeTimer: number;
    autoModeState: 'N_GREEN' | 'N_YELLOW' | 'S_GREEN' | 'S_YELLOW' | 'E_GREEN' | 'E_YELLOW' | 'W_GREEN' | 'W_YELLOW';
    isEmergency: boolean;
    emergencyTimer: number;

    violations: Violation[] = [];
    emergencyLog: EmergencyEvent[] = [];
    emergencyResponseTimes: number[] = [];
    totalVehicleCount: number = 0;
    
    private lastTime: number;

    constructor() {
        this.signals = [new TrafficSignal(), new TrafficSignal(), new TrafficSignal(), new TrafficSignal()]; // 0: N, 1: S, 2: E, 3: W
        this.roads = [new Road('north', this), new Road('south', this), new Road('east', this), new Road('west', this)];
        this.isAutoMode = true;
        this.autoModeTimer = 10000;
        this.autoModeState = 'N_GREEN';
        this.signals[0].state = "GREEN";
        this.lastTime = performance.now();

        this.isEmergency = false;
        this.emergencyTimer = 0;
    }

    update() {
        const now = performance.now();
        const deltaTime = now - this.lastTime;
        this.lastTime = now;

        if (this.isEmergency) {
            this.emergencyTimer -= deltaTime;
            if(this.emergencyTimer <= 0) {
                this.isEmergency = false;
                this.isAutoMode = true; // resume auto mode
                this.autoModeState = 'N_YELLOW'; // transition gracefully
                this.autoModeTimer = 2000;
            }
        } else if (this.isAutoMode) {
            this.autoModeTimer -= deltaTime;
            if (this.autoModeTimer <= 0) {
                this.transitionAutoMode();
            }
        }
        
        this.roads[0].update(deltaTime, this.signals[0].state); // North
        this.roads[1].update(deltaTime, this.signals[1].state); // South
        this.roads[2].update(deltaTime, this.signals[2].state); // East
        this.roads[3].update(deltaTime, this.signals[3].state); // West
    }

    transitionAutoMode() {
        this.signals.forEach(s => s.state = 'RED'); // Set all to red first

        switch (this.autoModeState) {
            case 'N_GREEN':
                this.autoModeState = 'N_YELLOW';
                this.signals[0].state = 'YELLOW';
                this.autoModeTimer = 2000;
                break;
            case 'N_YELLOW':
                this.autoModeState = 'E_GREEN';
                this.signals[2].state = 'GREEN';
                this.autoModeTimer = 10000;
                break;
            case 'E_GREEN':
                this.autoModeState = 'E_YELLOW';
                this.signals[2].state = 'YELLOW';
                this.autoModeTimer = 2000;
                break;
            case 'E_YELLOW':
                this.autoModeState = 'S_GREEN';
                this.signals[1].state = 'GREEN';
                this.autoModeTimer = 10000;
                break;
            case 'S_GREEN':
                this.autoModeState = 'S_YELLOW';
                this.signals[1].state = 'YELLOW';
                this.autoModeTimer = 2000;
                break;
            case 'S_YELLOW':
                this.autoModeState = 'W_GREEN';
                this.signals[3].state = 'GREEN';
                this.autoModeTimer = 10000;
                break;
            case 'W_GREEN':
                this.autoModeState = 'W_YELLOW';
                this.signals[3].state = 'YELLOW';
                this.autoModeTimer = 2000;
                break;
            case 'W_YELLOW':
                this.autoModeState = 'N_GREEN';
                this.signals[0].state = 'GREEN';
                this.autoModeTimer = 10000;
                break;
        }
    }

    toggleAutoMode() {
        this.isAutoMode = !this.isAutoMode;
        if (this.isAutoMode) {
            // Reset to a known state when re-enabling
            this.autoModeState = 'N_GREEN';
            this.signals.forEach((s, i) => s.state = i === 0 ? 'GREEN' : 'RED');
            this.autoModeTimer = 10000;
        }
    }

    setAllSignals(state: SignalState) {
        this.signals.forEach(s => s.state = state);
    }
    
    triggerEmergency() {
        if (this.isEmergency) return;

        this.isEmergency = true;
        this.isAutoMode = false;
        this.emergencyTimer = 15000; // 15 seconds emergency
        
        // Spawn an emergency vehicle on a random road
        const emergencyRoadIndex = Math.floor(Math.random() * this.roads.length);
        const road = this.roads[emergencyRoadIndex];
        const emergencyVehicle = new Vehicle(road, 'emergency');
        road.vehicles.unshift(emergencyVehicle);

        // Set only that road's signal to GREEN
        this.signals.forEach((s, i) => {
            s.state = i === emergencyRoadIndex ? 'GREEN' : 'RED';
        });

        const startTime = Date.now();
        const checkPassed = setInterval(() => {
            const v = road.vehicles.find(v => v.id === emergencyVehicle.id);
            const offScreen = !v || v.x < -25 || v.x > 425 || v.y < -25 || v.y > 425;
            if(offScreen) {
                const clearanceTime = (Date.now() - startTime) / 1000;
                this.emergencyResponseTimes.push(clearanceTime);
                this.emergencyLog.unshift({
                    id: `EV-${emergencyIdCounter++}`,
                    time: new Date().toLocaleTimeString(),
                    type: 'Ambulance',
                    clearanceTime
                });
                if(this.emergencyLog.length > 10) this.emergencyLog.pop();
                clearInterval(checkPassed);
            }
        }, 100);
    }

    addViolation(roadName: string) {
        this.violations.unshift({
            id: `V-${violationIdCounter++}`,
            time: new Date().toLocaleTimeString(),
            location: roadName.charAt(0).toUpperCase() + roadName.slice(1) + 'bound',
            type: "Red Light",
            fine: "$150"
        });
        if(this.violations.length > 10) this.violations.pop();
    }

    getStats(): Stats {
        let totalWaitTime = 0;
        let waitingVehiclesCount = 0;
        let vehicleCount = 0;
        this.roads.forEach(road => {
            vehicleCount += road.vehicles.length;
            road.vehicles.forEach(v => {
                if (!v.isMoving) {
                    totalWaitTime += v.waitTime;
                    waitingVehiclesCount++;
                }
            })
        });

        const lastEmergencyClearance = this.emergencyResponseTimes.length > 0 ? this.emergencyResponseTimes[this.emergencyResponseTimes.length - 1] : null;
        const avgEmergencyResponse = this.emergencyResponseTimes.length > 0 ? this.emergencyResponseTimes.reduce((a, b) => a + b, 0) / this.emergencyResponseTimes.length : 0;
        const avgWaitTime = waitingVehiclesCount > 0 ? (totalWaitTime / waitingVehiclesCount) / 1000 : 0;
        
        return {
            totalVehicles: this.totalVehicleCount + vehicleCount,
            avgWaitTime,
            vehiclesByDirection: {
                north: this.roads[0].vehicles.length,
                south: this.roads[1].vehicles.length,
                east: this.roads[2].vehicles.length,
                west: this.roads[3].vehicles.length,
            },
            avgEmergencyResponse,
            lastEmergencyClearance
        };
    }
}
