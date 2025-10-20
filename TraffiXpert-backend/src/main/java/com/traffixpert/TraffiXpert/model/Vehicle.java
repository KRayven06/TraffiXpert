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
    private boolean isTurning = false;
    private double turnAngle = 0; // Current angle during turn (might not be needed if using accumulatedTurn)
    private double initialAngle;
    private Double destinationAngle = null; // Use Double (object) for nullability
    private double totalTurnAngle = 0; // Total degrees to turn (+90 right, -90 left)
    private double accumulatedTurn = 0; // How much has been turned so far

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
        this.initialAngle = road.getAngle();

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

        // Determine turn direction based on random number
        double rand = ThreadLocalRandom.current().nextDouble();
        if (rand < 0.5) this.turn = TurnDirection.STRAIGHT;
        else if (rand < 0.75) this.turn = TurnDirection.LEFT;
        else this.turn = TurnDirection.RIGHT;

    }

    /**
     * Handles the logic for turning the vehicle within the intersection.
     * @param deltaTime Time elapsed since last update.
     */
    private void handleTurning(double deltaTime) {
        // Define the intersection turning box
        final double turnBoxX1 = 160.0;
        final double turnBoxY1 = 160.0;
        final double turnBoxX2 = 240.0;
        final double turnBoxY2 = 240.0;

        boolean inTurnBox = this.x > turnBoxX1 && this.x < turnBoxX2 &&
                            this.y > turnBoxY1 && this.y < turnBoxY2;

        // Start turning if appropriate
        if (this.turn != TurnDirection.STRAIGHT && inTurnBox && !this.isTurning && this.destinationAngle == null) {
            this.isTurning = true;
            int turnDirectionMultiplier = (this.turn == TurnDirection.RIGHT) ? 1 : -1;
            this.totalTurnAngle = 90.0 * turnDirectionMultiplier;
            // Calculate destination angle, ensuring it's within 0-359 degrees
            this.destinationAngle = (this.initialAngle + this.totalTurnAngle + 360) % 360;
            this.accumulatedTurn = 0;
        }

        // Apply turn if currently turning
        if (this.isTurning) {
            final double turnRate = 2.0; // degrees per frame/update tick (adjust based on deltaTime scale)
            int turnDirectionMultiplier = this.totalTurnAngle > 0 ? 1 : -1;
            // Adjust turn amount based on deltaTime. The factor 0.1 was used in TS, might need tuning.
            double turnAmount = turnDirectionMultiplier * turnRate * deltaTime * 0.1;

            if (Math.abs(this.accumulatedTurn) < Math.abs(this.totalTurnAngle)) {
                this.angle = (this.angle + turnAmount + 360) % 360; // Keep angle between 0-359
                this.accumulatedTurn += turnAmount;
            } else {
                // Snap to final angle to avoid floating point errors
                if (this.destinationAngle != null) {
                    this.angle = this.destinationAngle;
                }
                this.isTurning = false;
                // Consider resetting initialAngle here if needed for subsequent turns, though unlikely in this sim
            }
        }
    }


    /**
     * Updates the vehicle's position and state based on traffic signals and other vehicles.
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
            if (distance < this.height * 1.5) {
                isStoppedByCar = true;
                break;
            }
        }

        RoadDirection direction = this.road.getDirection();
        double potentialX = this.x + Math.sin(Math.toRadians(this.angle)) * this.speed * deltaTime;
        double potentialY = this.y - Math.cos(Math.toRadians(this.angle)) * this.speed * deltaTime;

        // Check if approaching the stop line
        boolean isApproachingStopLine = false;
        switch (direction) {
            case SOUTH: // Moving South (from North road)
                isApproachingStopLine = this.y < stopPosition && potentialY >= stopPosition;
                break;
            case NORTH: // Moving North (from South road)
                isApproachingStopLine = this.y > stopPosition && potentialY <= stopPosition;
                break;
            case WEST: // Moving West (from East road)
                isApproachingStopLine = this.x > stopPosition && potentialX <= stopPosition;
                break;
            case EAST: // Moving East (from West road)
                isApproachingStopLine = this.x < stopPosition && potentialX >= stopPosition;
                break;
        }


        // Check if past the stop line
        boolean hasPassedStopLine = false;
         switch (direction) {
            case SOUTH: hasPassedStopLine = this.y >= stopPosition; break; // from North
            case NORTH: hasPassedStopLine = this.y <= stopPosition; break; // from South
            case WEST:  hasPassedStopLine = this.x <= stopPosition; break; // from East
            case EAST:  hasPassedStopLine = this.x >= stopPosition; break; // from West
        }


        // Determine if the vehicle should stop
        if (!hasPassedStopLine && isApproachingStopLine && signal != SignalState.GREEN && this.type != VehicleType.EMERGENCY) {
            this.isMoving = false;
        } else if (isStoppedByCar) {
             this.isMoving = false;
        } else {
            // Check for red light violation (small random chance for normal vehicles)
             if (!hasPassedStopLine && isApproachingStopLine && signal == SignalState.RED && this.type == VehicleType.NORMAL && ThreadLocalRandom.current().nextDouble() < 0.0005) {
                // Get simulation instance (we need to figure out the best way to access it - dependency injection later)
                SimulationService simService = this.road.getSimulation(); // Assuming Road holds a reference
                if (simService != null) {
                    simService.addViolation(this.road.getName().name()); // Use enum name
                }
                this.isMoving = true; // Run the red light
            } else {
                this.isMoving = true;
            }
        }

        // Update wait time
        if (!this.isMoving) {
            this.waitTime += deltaTime;
        } else {
            this.waitTime = 0; // Reset wait time when moving
        }

        // Update position if moving
        if (this.isMoving) {
            // Need to convert angle to radians for Math.sin/cos
            this.x = potentialX;
            this.y = potentialY;
        }

        // Handle turning only if past the stop line
        if (hasPassedStopLine) {
            handleTurning(deltaTime);
        }
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
    public boolean isTurning() { return isTurning; }

    // --- Setters (Add if needed, e.g., for position adjustments or state changes) ---
     public void setX(double x) { this.x = x; }
     public void setY(double y) { this.y = y; }
     public void setAngle(double angle) { this.angle = angle; }
     public void setMoving(boolean moving) { isMoving = moving; }

    // No setter for final fields like width, height
    // No setter for ID
    // Setters for road, color, type, turn might indicate design issues if needed after construction
}
