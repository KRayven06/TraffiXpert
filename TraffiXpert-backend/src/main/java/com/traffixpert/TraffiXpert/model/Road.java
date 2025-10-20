package com.traffixpert.TraffiXpert.model; // Adjust package name if needed

import com.traffixpert.TraffiXpert.service.SimulationService; // Placeholder - We'll create this later

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

public class Road {

    private RoadDirection name; // Use the RoadDirection enum
    private List<Vehicle> vehicles; // List to hold vehicles on this road
    private double spawnTimer;
    private double startX;
    private double startY;
    private double angle; // In degrees
    private double stopLine;
    private RoadDirection direction; // The direction vehicles *move* towards
    private SimulationService simulation; // Reference to the main simulation

    // Maximum vehicles allowed on this road segment
    private static final int MAX_VEHICLES_PER_ROAD = 10;
    // Base spawn time (milliseconds)
    private static final double BASE_SPAWN_TIME = 4000.0;
    // Random additional spawn time (milliseconds)
    private static final double RANDOM_SPAWN_TIME = 4000.0;

    /**
     * Constructor for Road.
     * @param name The direction this road represents (NORTH, SOUTH, EAST, WEST).
     * @param simulation The main SimulationService instance.
     */
    public Road(RoadDirection name, SimulationService simulation) {
        this.name = name;
        this.simulation = simulation;
        this.vehicles = new ArrayList<>();
        // Initial random spawn timer
        this.spawnTimer = ThreadLocalRandom.current().nextDouble(BASE_SPAWN_TIME);

        // Set road properties based on its name (direction)
        switch (name) {
            case NORTH: // Road where cars start North and move South
                this.startX = 215; this.startY = -20; this.angle = 180; this.stopLine = 160; this.direction = RoadDirection.SOUTH;
                break;
            case SOUTH: // Road where cars start South and move North
                this.startX = 175; this.startY = 420; this.angle = 0; this.stopLine = 240; this.direction = RoadDirection.NORTH;
                break;
            case EAST: // Road where cars start East and move West
                this.startX = 420; this.startY = 215; this.angle = -90; this.stopLine = 240; this.direction = RoadDirection.WEST;
                break;
            case WEST: // Road where cars start West and move East
                this.startX = -20; this.startY = 175; this.angle = 90; this.stopLine = 160; this.direction = RoadDirection.EAST;
                break;
            default:
                 // Should not happen with enum, but good practice
                 throw new IllegalArgumentException("Invalid road name: " + name);
        }
    }

    /**
     * Updates the state of the road, including spawning new vehicles and updating existing ones.
     * @param deltaTime Time elapsed since the last update.
     * @param signal The current state of the traffic signal for this road.
     */
    public void update(double deltaTime, SignalState signal) {
        // Handle spawning
        this.spawnTimer -= deltaTime;
        if (this.spawnTimer <= 0) {
            // Only spawn if below the vehicle limit for this road
            if (this.vehicles.size() < MAX_VEHICLES_PER_ROAD) {
                // Add new vehicle at the beginning of the list (closest to spawn point)
                this.vehicles.add(0, new Vehicle(this, VehicleType.NORMAL)); // Assuming default spawn is NORMAL
            }
            // Reset spawn timer with random interval
            this.spawnTimer = BASE_SPAWN_TIME + ThreadLocalRandom.current().nextDouble(RANDOM_SPAWN_TIME);
        }

        // Update vehicles, iterating from back to front (farthest from spawn to closest)
        for (int i = this.vehicles.size() - 1; i >= 0; i--) {
            Vehicle vehicle = this.vehicles.get(i);
            // Get vehicles physically in front (those later in the list)
            List<Vehicle> vehiclesInFront = this.vehicles.subList(i + 1, this.vehicles.size());
            vehicle.update(deltaTime, signal, vehiclesInFront);
        }

        // Remove vehicles that are off-screen using an iterator for safe removal
        int initialCount = this.vehicles.size();
        Iterator<Vehicle> iterator = this.vehicles.iterator();
        while (iterator.hasNext()) {
            Vehicle v = iterator.next();
            // Define screen bounds
            if (v.getX() < -30 || v.getX() > 430 || v.getY() < -30 || v.getY() > 430) {
                iterator.remove();
            }
        }
        int finalCount = this.vehicles.size();
        // Notify simulation service about vehicles that left the screen
        if (this.simulation != null) {
            this.simulation.incrementTotalVehicleCount(initialCount - finalCount);
        }
    }

    // --- Getters ---
    public RoadDirection getName() { return name; }
    public List<Vehicle> getVehicles() { return vehicles; }
    public double getSpawnTimer() { return spawnTimer; }
    public double getStartX() { return startX; }
    public double getStartY() { return startY; }
    public double getAngle() { return angle; }
    public double getStopLine() { return stopLine; }
    public RoadDirection getDirection() { return direction; }
    public SimulationService getSimulation() { return simulation; } // Needed by Vehicle

    // --- Setters (Add if necessary, e.g., for dynamically changing spawn rates) ---
    // public void setSpawnTimer(double spawnTimer) { this.spawnTimer = spawnTimer; }

    /**
     * Adds a vehicle to the front of the road's vehicle list (closest to spawn).
     * Used for explicitly adding vehicles like emergency vehicles.
     * @param vehicle The vehicle to add.
     */
    public void addVehicleToFront(Vehicle vehicle) {
        if (this.vehicles.size() < MAX_VEHICLES_PER_ROAD) {
             this.vehicles.add(0, vehicle);
        }
        // Optionally handle cases where the road is full
    }
}
