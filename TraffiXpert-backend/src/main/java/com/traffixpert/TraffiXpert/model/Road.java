package com.traffixpert.TraffiXpert.model; // Adjust package name if needed

import com.traffixpert.TraffiXpert.service.SimulationService;

import java.util.ArrayList;
import java.util.Collections; // Import Collections
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

public class Road {

    private RoadDirection name;
    private List<Vehicle> vehicles; // Use synchronized list
    private double spawnTimer;
    private double startX;
    private double startY;
    private double angle;
    private double stopLine;
    private RoadDirection direction;
    private SimulationService simulation; // Reference to the main simulation

    private static final int MAX_VEHICLES_PER_ROAD = 10;
    private static final double BASE_SPAWN_TIME = 4000.0;
    private static final double RANDOM_SPAWN_TIME = 4000.0;

    public Road(RoadDirection name, SimulationService simulation) {
        this.name = name;
        this.simulation = simulation;
        // Use synchronized list for basic thread safety during add/remove/iterate
        this.vehicles = Collections.synchronizedList(new ArrayList<>());
        this.spawnTimer = ThreadLocalRandom.current().nextDouble(BASE_SPAWN_TIME);

        switch (name) {
            case NORTH: this.startX = 215; this.startY = -20; this.angle = 180; this.stopLine = 160; this.direction = RoadDirection.SOUTH; break;
            case SOUTH: this.startX = 175; this.startY = 420; this.angle = 0; this.stopLine = 240; this.direction = RoadDirection.NORTH; break;
            case EAST: this.startX = 420; this.startY = 215; this.angle = -90; this.stopLine = 240; this.direction = RoadDirection.WEST; break;
            case WEST: this.startX = -20; this.startY = 175; this.angle = 90; this.stopLine = 160; this.direction = RoadDirection.EAST; break;
            default: throw new IllegalArgumentException("Invalid road name: " + name);
        }
    }

    public void update(double deltaTime, SignalState signal) {
        // Handle spawning
        this.spawnTimer -= deltaTime;
        if (this.spawnTimer <= 0) {
            // Use synchronized block for size check and add
            synchronized (this.vehicles) {
                 if (this.vehicles.size() < MAX_VEHICLES_PER_ROAD) {
                    // Add new vehicle at the beginning of the list (closest to spawn point)
                    this.vehicles.add(0, new Vehicle(this, VehicleType.NORMAL));
                 }
            }
            // Reset spawn timer with random interval
            this.spawnTimer = BASE_SPAWN_TIME + ThreadLocalRandom.current().nextDouble(RANDOM_SPAWN_TIME);
        }

        // --- Use synchronized block for iteration and getting sublist ---
        synchronized (this.vehicles) {
             // Iterate from back to front (farthest from spawn to closest)
             for (int i = this.vehicles.size() - 1; i >= 0; i--) {
                 // Check bounds just in case list was modified unexpectedly (though synchronized helps)
                 if (i >= this.vehicles.size()) continue;

                 Vehicle vehicle = this.vehicles.get(i);
                 // Get vehicles physically in front (those later in the list)
                 // Create subList within the synchronized block
                 List<Vehicle> vehiclesInFront = (i + 1 < this.vehicles.size())
                     ? new ArrayList<>(this.vehicles.subList(i + 1, this.vehicles.size())) // Create a safe copy
                     : Collections.emptyList(); // Handle edge case

                 // Update vehicle (pass the safe copy of vehicles in front)
                 vehicle.update(deltaTime, signal, vehiclesInFront);
             }
        }
        // --- End Modification ---


        // --- Remove vehicles that are off-screen and notify SimulationService ---
        // Use synchronized block for iterator and removal
        synchronized (this.vehicles) {
             Iterator<Vehicle> iterator = this.vehicles.iterator();
             while (iterator.hasNext()) {
                 Vehicle v = iterator.next();
                 // Define screen bounds
                 if (v.getX() < -30 || v.getX() > 430 || v.getY() < -30 || v.getY() > 430) {
                     long exitedVehicleId = v.getId(); // Get ID before removing
                     iterator.remove(); // Remove from list

                     // --- Notify simulation service about the exit, passing the ID ---
                     if (this.simulation != null) {
                         this.simulation.recordVehicleExit(exitedVehicleId);
                         // Note: incrementTotalVehicleCount is now called inside recordVehicleExit in SimulationService
                     }
                     // --- End Notification ---
                 }
             }
        }
    }


    /**
     * Adds a vehicle to the front of the road's vehicle list (closest to spawn).
     * Used for explicitly adding vehicles like emergency vehicles.
     * @param vehicle The vehicle to add.
     */
    public void addVehicleToFront(Vehicle vehicle) {
         // Use synchronized block
         synchronized (this.vehicles) {
            if (this.vehicles.size() < MAX_VEHICLES_PER_ROAD) {
                 this.vehicles.add(0, vehicle); // Add at the beginning
            } else {
                 System.out.println("Could not add emergency vehicle to road " + this.name + ", road is full.");
            }
         }
    }

    // --- Getters ---
    public RoadDirection getName() { return name; }

    // --- MODIFIED: Return copy within synchronized block ---
    /**
     * Returns a copy of the current list of vehicles on this road.
     * This is thread-safe for reading the list state at a point in time.
     * @return A new List containing the vehicles.
     */
    public List<Vehicle> getVehicles() {
        synchronized (this.vehicles) {
             return new ArrayList<>(this.vehicles); // Return a copy
        }
    }
    // --- End Modification ---

    public double getSpawnTimer() { return spawnTimer; }
    public double getStartX() { return startX; }
    public double getStartY() { return startY; }
    public double getAngle() { return angle; }
    public double getStopLine() { return stopLine; }
    public RoadDirection getDirection() { return direction; }
    public SimulationService getSimulation() { return simulation; } // Needed by Vehicle
}