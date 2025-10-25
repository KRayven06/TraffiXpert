// File: krayven06/traffixpert/TraffiXpert-d86fc4960adf4b96fd86bdc678e4c92e1a4188de/TraffiXpert-backend/src/main/java/com/traffixpert/TraffiXpert/model/Vehicle.java
package com.traffixpert.TraffiXpert.model; // Adjust package name if needed

import com.traffixpert.TraffiXpert.service.SimulationService; // Placeholder - We'll create this later

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicLong;

public class Vehicle {

    // --- Static Members ---
    private static final double VEHICLE_WIDTH = 10.0;
    private static final double VEHICLE_HEIGHT = 16.0;
    private static final VehicleColor[] CAR_COLORS = {
            VehicleColor.BLUE, VehicleColor.RED, VehicleColor.PURPLE,
            VehicleColor.YELLOW, VehicleColor.INDIGO, VehicleColor.PINK,
            VehicleColor.GREEN
    };
    private static final AtomicLong vehicleIdCounter = new AtomicLong(0); // Thread-safe counter

    // --- Instance Members ---
    private long id; // Use long for potentially many vehicles
    private double x;
    private double y;
    private final double width = VEHICLE_WIDTH; // Final as it doesn't change
    private final double height = VEHICLE_HEIGHT; // Final as it doesn't change
    private double speed;
    private double angle; // In degrees
    private Road road; // We'll define Road class later
    private boolean isMoving;
    private VehicleColor color;
    private VehicleType type;
    private double waitTime;
    private TurnDirection turn;
    // --- NEW: Simplified Turning State ---
    private boolean hasPassedStopLine = false;
    private boolean hasTurned = false; // Flag to ensure turn happens only once


    /**
     * Constructor for Vehicle.
     * @param road The Road this vehicle starts on.
     * @param type The type of vehicle (NORMAL or EMERGENCY).
     */
    public Vehicle(Road road, VehicleType type) {
        this.id = vehicleIdCounter.getAndIncrement();
        this.road = road;
        this.type = type;

        this.x = road.getStartX();
        this.y = road.getStartY();
        this.angle = road.getAngle();
        // Removed initialAngle as it's not needed for instant turns

        // Speed based on type
        if (type == VehicleType.EMERGENCY) {
            this.speed = 0.1;
            this.color = VehicleColor.WHITE;
        } else {
            // Equivalent to 0.05 + Math.random() * 0.02
            this.speed = 0.05 + ThreadLocalRandom.current().nextDouble(0.02);
            // Select random color
            this.color = CAR_COLORS[ThreadLocalRandom.current().nextInt(CAR_COLORS.length)];
        }

        this.isMoving = true;
        this.waitTime = 0;

        // Determine turn direction based on random number (using original probabilities)
        double rand = ThreadLocalRandom.current().nextDouble();
        if (rand < 0.5) this.turn = TurnDirection.STRAIGHT;
        else if (rand < 0.75) this.turn = TurnDirection.LEFT;
        else this.turn = TurnDirection.RIGHT;

        // Reset turning state flags
        this.hasPassedStopLine = false;
        this.hasTurned = false;
    }

    // --- REMOVED handleTurning method ---


    /**
     * Updates the vehicle's position and state based on traffic signals and other vehicles.
     * Includes NEW instant turning logic based on position.
     * @param deltaTime Time elapsed since last update.
     * @param signal The current state of the traffic signal for this vehicle's road.
     * @param vehiclesInFront A list of vehicles ahead of this one in the same lane.
     */
    public void update(double deltaTime, SignalState signal, List<Vehicle> vehiclesInFront) {
        double stopPosition = this.road.getStopLine();
        boolean isStoppedByCar = false;

        // Check for collision with vehicles in front
        for (Vehicle frontVehicle : vehiclesInFront) {
            double distance = Math.hypot(this.x - frontVehicle.getX(), this.y - frontVehicle.getY());
            // Stop if too close to the vehicle in front (using 1.5 times height as buffer)
            // Using original simpler distance check
            if (distance < this.height * 1.5) {
                isStoppedByCar = true;
                break;
            }
        }

        RoadDirection direction = this.road.getDirection(); // The direction the road ENTERS the intersection from (e.g., NORTH means car moves SOUTH)
        double potentialX = this.x + Math.sin(Math.toRadians(this.angle)) * this.speed * deltaTime;
        double potentialY = this.y - Math.cos(Math.toRadians(this.angle)) * this.speed * deltaTime;

        // --- Stop Line Checks ---
        // Check if the vehicle is *about* to cross the stop line in this update
        boolean isApproachingStopLine = false;
        switch (this.road.getName()) { // Use road's origin name for approach check
            case NORTH: isApproachingStopLine = this.y < stopPosition && potentialY >= stopPosition; break; // Moving South
            case SOUTH: isApproachingStopLine = this.y > stopPosition && potentialY <= stopPosition; break; // Moving North
            case EAST:  isApproachingStopLine = this.x > stopPosition && potentialX <= stopPosition; break; // Moving West
            case WEST:  isApproachingStopLine = this.x < stopPosition && potentialX >= stopPosition; break; // Moving East
        }
        // Check if the vehicle has *already* crossed the stop line
        if (!this.hasPassedStopLine) { // Only update if not already marked as passed
             switch (this.road.getName()) { // Use road's origin name
                 case NORTH: this.hasPassedStopLine = this.y >= stopPosition; break; // Moving South
                 case SOUTH: this.hasPassedStopLine = this.y <= stopPosition; break; // Moving North
                 case EAST:  this.hasPassedStopLine = this.x <= stopPosition; break; // Moving West
                 case WEST:  this.hasPassedStopLine = this.x >= stopPosition; break; // Moving East
             }
        }
        // --- End Stop Line Checks ---


        // --- Determine Movement State (Stop/Go/Violate - KEEPING LATEST WORKING VERSION) ---
         boolean shouldViolate = false;
         // Check conditions for potentially violating a RED light BEFORE passing the line
         if (!this.hasPassedStopLine && isApproachingStopLine && signal == SignalState.RED && this.type == VehicleType.NORMAL) {
             if (ThreadLocalRandom.current().nextDouble() < 0.01) { // 1% violation chance
                  shouldViolate = true;
                  SimulationService simService = this.road.getSimulation();
                  if (simService != null) {
                      System.out.println("VIOLATION TRIGGERED for vehicle " + this.getId() + " on " + this.road.getName().name());
                      simService.addViolation(this.road.getName().name());
                  }
             }
         }

         // Decide if the car should be moving based on all factors
         if (isStoppedByCar) {
             this.isMoving = false; // Stop if too close to car in front
         } else if (!this.hasPassedStopLine && isApproachingStopLine && signal != SignalState.GREEN && this.type != VehicleType.EMERGENCY && !shouldViolate) {
              // Stop if approaching Red/Yellow, not emergency, AND not violating
             this.isMoving = false;
         } else {
             // Otherwise, move (Green light, past stop line, emergency, OR violating)
             this.isMoving = true;
         }
        // --- End Movement State ---


        // --- Update Wait Time ---
        if (!this.isMoving) {
            this.waitTime += deltaTime;
        } else {
            this.waitTime = 0; // Reset wait time when moving
        }
        // --- End Wait Time ---


        // --- Update Position ---
        if (this.isMoving) {
            // Need to convert angle to radians for Math.sin/cos
            this.x = potentialX;
            this.y = potentialY;
        }
        // --- End Update Position ---


         // --- NEW Turning Logic (Instantaneous based on position) ---
         if (this.hasPassedStopLine && !this.hasTurned && this.turn != TurnDirection.STRAIGHT) {
             boolean turnExecuted = false;
             // Determine current road origin (where the car came FROM)
             RoadDirection origin = this.road.getName();

             switch (origin) {
                 case NORTH: // Moving South (angle initially 180)
                     if (this.turn == TurnDirection.LEFT && this.y >= 185) { this.angle = 90; turnExecuted = true; } // Turn East
                     else if (this.turn == TurnDirection.RIGHT && this.y >= 215) { this.angle = 270; turnExecuted = true; } // Turn West (-90 becomes 270)
                     break;
                 case SOUTH: // Moving North (angle initially 0)
                     if (this.turn == TurnDirection.LEFT && this.y <= 215) { this.angle = 270; turnExecuted = true; } // Turn West (-90 becomes 270)
                     else if (this.turn == TurnDirection.RIGHT && this.y <= 185) { this.angle = 90; turnExecuted = true; } // Turn East
                     break;
                 case EAST: // Moving West (angle initially -90 or 270)
                     if (this.turn == TurnDirection.LEFT && this.x <= 185) { this.angle = 0; turnExecuted = true; } // Turn South
                     else if (this.turn == TurnDirection.RIGHT && this.x <= 215) { this.angle = 180; turnExecuted = true; } // Turn North
                     break;
                 case WEST: // Moving East (angle initially 90)
                     if (this.turn == TurnDirection.LEFT && this.x >= 215) { this.angle = 180; turnExecuted = true; } // Turn North
                     else if (this.turn == TurnDirection.RIGHT && this.x >= 185) { this.angle = 0; turnExecuted = true; } // Turn South
                     break;
             }

             if (turnExecuted) {
                 this.hasTurned = true;
                 // Ensure angle is within 0-359 if needed, although the direct assignments should be fine
                 this.angle = (this.angle + 360) % 360;
             }
         }
         // --- End NEW Turning Logic ---
    }


    // --- Getters ---
    public long getId() { return id; }
    public double getX() { return x; }
    public double getY() { return y; }
    public double getWidth() { return width; }
    public double getHeight() { return height; }
    public double getSpeed() { return speed; }
    public double getAngle() { return angle; }
    public Road getRoad() { return road; }
    public boolean isMoving() { return isMoving; }
    public VehicleColor getColor() { return color; }
    public VehicleType getType() { return type; }
    public double getWaitTime() { return waitTime; }
    public TurnDirection getTurn() { return turn; }
    // Removed isTurning getter

    // --- Setters (Add if needed, e.g., for position adjustments or state changes) ---
     public void setX(double x) { this.x = x; }
     public void setY(double y) { this.y = y; }
     public void setAngle(double angle) { this.angle = angle; }
     public void setMoving(boolean moving) { isMoving = moving; }

    // No setter for final fields like width, height
    // No setter for ID
    // Setters for road, color, type, turn might indicate design issues if needed after construction
}