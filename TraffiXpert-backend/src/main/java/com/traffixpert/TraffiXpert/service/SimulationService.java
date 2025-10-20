package com.traffixpert.TraffiXpert.service; // Adjust package name if needed

import com.traffixpert.TraffiXpert.model.*; // Import model classes
// import org.springframework.scheduling.annotation.Scheduled; // REMOVE or COMMENT OUT this import
import org.springframework.stereotype.Service; // Import Spring Service annotation

import jakarta.annotation.PostConstruct; // Import for PostConstruct
import jakarta.annotation.PreDestroy; // Import for PreDestroy
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*; // Import concurrent package
import java.util.concurrent.atomic.AtomicLong;

@Service // Mark this as a Spring Service component
public class SimulationService {

    // --- State Variables ---
    private final List<TrafficSignal> signals;
    private final List<Road> roads;
    private boolean isAutoMode;
    private double autoModeTimer;
    private AutoModeState autoModeState; // Enum defined below
    private boolean isEmergency;
    private double emergencyTimer;
    private long lastTime; // Use long for System.nanoTime()

    // --- NEW: Simulation Loop Control ---
    private volatile boolean isRunning = false; // volatile for thread safety
    private ScheduledExecutorService scheduler;
    private ScheduledFuture<?> simulationTaskFuture;
    private static final long UPDATE_INTERVAL_MS = 50; // Approx 20 FPS

    // --- Data Logging ---
    // Using ConcurrentLinkedDeque for thread-safe adding/removing from head/tail
    private final ConcurrentLinkedDeque<Violation> violations = new ConcurrentLinkedDeque<>();
    private final ConcurrentLinkedDeque<EmergencyEvent> emergencyLog = new ConcurrentLinkedDeque<>();
    private final List<Double> emergencyResponseTimes = Collections.synchronizedList(new ArrayList<>()); // Thread-safe list
    private long totalVehicleCount = 0; // Cumulative count of vehicles that have passed

    private static final int MAX_LOG_SIZE = 10; // Max size for violation/emergency logs

    private static final AtomicLong violationIdCounter = new AtomicLong(0);
    private static final AtomicLong emergencyIdCounter = new AtomicLong(0);

    // Formatter for time strings in logs
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm:ss");


    // Enum for AutoModeState, mirroring TS logic
    private enum AutoModeState {
        N_GREEN, N_YELLOW,
        S_GREEN, S_YELLOW,
        E_GREEN, E_YELLOW,
        W_GREEN, W_YELLOW
    }

    /**
     * Constructor for SimulationService.
     * Initializes signals, roads, and default state.
     */
    public SimulationService() {
        // Initialize signals (0:N, 1:S, 2:E, 3:W)
        signals = new ArrayList<>(4);
        for (int i = 0; i < 4; i++) {
            signals.add(new TrafficSignal());
        }

        // Initialize roads, passing 'this' (the service instance)
        roads = new ArrayList<>(4);
        roads.add(new Road(RoadDirection.NORTH, this));
        roads.add(new Road(RoadDirection.SOUTH, this));
        roads.add(new Road(RoadDirection.EAST, this));
        roads.add(new Road(RoadDirection.WEST, this));

        // Initial state setup
        this.isAutoMode = true;
        this.autoModeTimer = 10000; // ms
        this.autoModeState = AutoModeState.N_GREEN;
        this.signals.get(0).setState(SignalState.GREEN); // North signal starts GREEN

        this.isEmergency = false;
        this.emergencyTimer = 0;

        // Initialize scheduler but don't start the task yet
        this.scheduler = Executors.newSingleThreadScheduledExecutor();
        this.lastTime = System.nanoTime(); // Initialize lastTime here
        // Start simulation by default (can be changed)
        // startSimulationLoop(); // Call start method below
    }

    // --- NEW: Start simulation on bean initialization ---
    @PostConstruct
    public void initializeSimulation() {
        startSimulationLoop(); // Start the loop when the service is ready
    }


    /**
     * Main update loop for the simulation. Called periodically by the scheduler.
     * Calculates deltaTime and updates signals, roads, and auto mode state.
     */
    public synchronized void update() { // Make synchronized to avoid race conditions with lastTime
        if (!isRunning) return; // Don't update if paused

        long now = System.nanoTime();
        // Calculate deltaTime in milliseconds
        double deltaTime = (now - this.lastTime) / 1_000_000.0;
        this.lastTime = now;

        // Prevent excessively large deltaTime if simulation was paused for a long time
        if (deltaTime > UPDATE_INTERVAL_MS * 5) { // e.g., if paused > 250ms
             System.out.println("Large deltaTime detected, capping: " + deltaTime);
             deltaTime = UPDATE_INTERVAL_MS; // Cap delta to avoid large jumps
        }


        // Handle emergency state
        if (this.isEmergency) {
            this.emergencyTimer -= deltaTime;
            if (this.emergencyTimer <= 0) {
                this.isEmergency = false;
                this.isAutoMode = true; // Resume auto mode after emergency
                this.autoModeState = AutoModeState.N_YELLOW; // Transition gracefully
                this.autoModeTimer = 2000; // Yellow light duration
            }
        } else if (this.isAutoMode) {
            // Handle auto mode transitions
            this.autoModeTimer -= deltaTime;
            if (this.autoModeTimer <= 0) {
                transitionAutoMode();
            }
        }

        // Update each road, passing the state of its corresponding signal
        // Use try-catch for potential concurrent modification if lists change unexpectedly
        try {
            roads.get(0).update(deltaTime, signals.get(0).getState()); // North Road (Signal 0)
            roads.get(1).update(deltaTime, signals.get(1).getState()); // South Road (Signal 1)
            roads.get(2).update(deltaTime, signals.get(2).getState()); // East Road (Signal 2)
            roads.get(3).update(deltaTime, signals.get(3).getState()); // West Road (Signal 3)
        } catch (Exception e) {
             System.err.println("Error during road update: " + e.getMessage());
             // Consider pausing simulation on error?
             // stopSimulationLoop();
        }
    }

    /**
     * Transitions the traffic signals based on the automatic cycle logic.
     */
    private void transitionAutoMode() {
        // Set all signals to RED initially
        signals.forEach(s -> s.setState(SignalState.RED));

        switch (this.autoModeState) {
            case N_GREEN:
                this.autoModeState = AutoModeState.N_YELLOW;
                signals.get(0).setState(SignalState.YELLOW);
                this.autoModeTimer = 2000; // Yellow duration
                break;
            case N_YELLOW:
                this.autoModeState = AutoModeState.E_GREEN;
                signals.get(2).setState(SignalState.GREEN); // East Green
                this.autoModeTimer = 10000; // Green duration
                break;
            case E_GREEN:
                 this.autoModeState = AutoModeState.E_YELLOW;
                 signals.get(2).setState(SignalState.YELLOW);
                 this.autoModeTimer = 2000;
                 break;
            case E_YELLOW:
                this.autoModeState = AutoModeState.S_GREEN;
                signals.get(1).setState(SignalState.GREEN); // South Green
                this.autoModeTimer = 10000;
                break;
            case S_GREEN:
                this.autoModeState = AutoModeState.S_YELLOW;
                signals.get(1).setState(SignalState.YELLOW);
                this.autoModeTimer = 2000;
                break;
            case S_YELLOW:
                this.autoModeState = AutoModeState.W_GREEN;
                signals.get(3).setState(SignalState.GREEN); // West Green
                this.autoModeTimer = 10000;
                break;
            case W_GREEN:
                this.autoModeState = AutoModeState.W_YELLOW;
                signals.get(3).setState(SignalState.YELLOW);
                this.autoModeTimer = 2000;
                break;
            case W_YELLOW:
                this.autoModeState = AutoModeState.N_GREEN;
                signals.get(0).setState(SignalState.GREEN); // North Green (Loop)
                this.autoModeTimer = 10000;
                break;
        }
    }

    /**
     * Toggles the automatic signal control mode on or off.
     */
    public void toggleAutoMode() {
        this.isAutoMode = !this.isAutoMode;
        if (this.isAutoMode) {
            // Reset to a known state when re-enabling
            this.autoModeState = AutoModeState.N_GREEN;
            for(int i=0; i<signals.size(); i++) {
                signals.get(i).setState(i == 0 ? SignalState.GREEN : SignalState.RED);
            }
            this.autoModeTimer = 10000;
        }
        // No explicit action needed when turning off auto mode in this implementation
    }

    /**
     * Sets all traffic signals to the specified state.
     * @param state The SignalState to set all signals to.
     */
    public void setAllSignals(SignalState state) {
        this.signals.forEach(s -> s.setState(state));
    }

    /**
     * Triggers an emergency sequence, spawning an emergency vehicle and setting signals.
     */
    public void triggerEmergency() {
        if (this.isEmergency) return; // Prevent triggering multiple emergencies simultaneously

        this.isEmergency = true;
        this.isAutoMode = false; // Disable auto mode during emergency
        this.emergencyTimer = 15000; // Emergency duration in ms

        // Spawn emergency vehicle on a random road
        int emergencyRoadIndex = ThreadLocalRandom.current().nextInt(this.roads.size());
        Road emergencyRoad = this.roads.get(emergencyRoadIndex);
        Vehicle emergencyVehicle = new Vehicle(emergencyRoad, VehicleType.EMERGENCY);
        emergencyRoad.addVehicleToFront(emergencyVehicle);

        // Set signals: GREEN for emergency road, RED for others
        for (int i = 0; i < this.signals.size(); i++) {
            this.signals.get(i).setState(i == emergencyRoadIndex ? SignalState.GREEN : SignalState.RED);
        }

        // --- Handle Clearance Time Logging ---
        // Placeholder for logging start time - actual logging done when vehicle leaves or timer ends
        long startTime = System.currentTimeMillis();

        // Add event to log immediately (clearance time will be approximate or logged later)
        String eventId = "EV-" + emergencyIdCounter.getAndIncrement();
        EmergencyEvent event = new EmergencyEvent(
            eventId,
            LocalTime.now(),
            "Ambulance", // Assuming type
            this.emergencyTimer / 1000.0 // Approximate clearance time in seconds
        );
        emergencyLog.addFirst(event);
        if (emergencyLog.size() > MAX_LOG_SIZE) {
            emergencyLog.pollLast(); // Remove oldest if log is full
        }
        // Add the approximate time to response times
        emergencyResponseTimes.add(this.emergencyTimer / 1000.0);


        // TODO: Implement a better way to track the specific emergency vehicle
        // and log the actual clearance time when it leaves the simulation area.
    }


    /**
     * Adds a violation record to the log.
     * @param roadNameString The name of the road where the violation occurred.
     */
    public void addViolation(String roadNameString) {
        String id = "V-" + violationIdCounter.getAndIncrement();
        LocalTime time = LocalTime.now();
        // Capitalize first letter of road name
        String location = roadNameString.substring(0, 1).toUpperCase() + roadNameString.substring(1).toLowerCase() + "bound";
        String type = "Red Light"; // Assuming only red light violations for now
        String fine = "$150"; // Hardcoded fine

        Violation violation = new Violation(id, time, location, type, fine);

        violations.addFirst(violation); // Add to the beginning of the deque
        // Limit log size
        if (violations.size() > MAX_LOG_SIZE) {
            violations.pollLast(); // Remove the oldest entry
        }
    }


     /**
     * Increments the total count of vehicles that have passed through.
     * Called by Road when vehicles exit.
     * @param count Number of vehicles that exited.
     */
    public synchronized void incrementTotalVehicleCount(int count) {
        this.totalVehicleCount += count;
    }


    // --- REMOVED @Scheduled annotation ---
    // @Scheduled(fixedRate = 50) // Run approximately 20 times per second
    // public void runSimulationUpdate() {
    //     this.update(); // Call the main update method
    // }

    // --- NEW: Simulation Control Methods ---

    /** Starts the simulation update loop if not already running. */
    public synchronized void startSimulationLoop() {
        if (!isRunning) {
            isRunning = true;
            lastTime = System.nanoTime(); // Reset timer when starting/resuming
            // Schedule the update task to run repeatedly
            simulationTaskFuture = scheduler.scheduleAtFixedRate(this::update, 0, UPDATE_INTERVAL_MS, TimeUnit.MILLISECONDS);
            System.out.println("Simulation loop started.");
        }
    }

    /** Stops the simulation update loop if running. */
    public synchronized void stopSimulationLoop() {
        if (isRunning) {
            isRunning = false;
            if (simulationTaskFuture != null && !simulationTaskFuture.isCancelled()) {
                simulationTaskFuture.cancel(false); // false = don't interrupt if running
            }
            System.out.println("Simulation loop stopped.");
        }
    }

    /** Cleans up the scheduler when the application shuts down. */
    @PreDestroy
    public void shutdownScheduler() {
        stopSimulationLoop(); // Ensure loop is stopped
        if (scheduler != null && !scheduler.isShutdown()) {
            scheduler.shutdown();
            try {
                // Wait a bit for tasks to finish
                if (!scheduler.awaitTermination(1, TimeUnit.SECONDS)) {
                    scheduler.shutdownNow();
                }
            } catch (InterruptedException ie) {
                scheduler.shutdownNow();
                Thread.currentThread().interrupt();
            }
            System.out.println("Simulation scheduler shut down.");
        }
    }

    // --- Getters for State (used by Controllers later) ---

    public boolean isSimulationRunning() { // NEW Getter for running state
        return isRunning;
    }

    public List<TrafficSignal> getSignals() {
        return signals;
    }

    public List<Road> getRoads() {
        return roads;
    }

    public boolean isAutoMode() {
        return isAutoMode;
    }

     public boolean isEmergency() {
        return isEmergency;
    }

    public List<Violation> getViolations() {
        // Return an immutable copy to prevent external modification
        return new ArrayList<>(violations);
    }

     public List<EmergencyEvent> getEmergencyLog() {
        // Return an immutable copy
        return new ArrayList<>(emergencyLog);
    }


    /**
     * Calculates and returns the current simulation statistics.
     * @return A Stats object containing current metrics.
     */
    public Stats getStats() {
        double totalWaitTime = 0;
        int waitingVehiclesCount = 0;
        int currentVehicleCount = 0;
        int northCount = 0, southCount = 0, eastCount = 0, westCount = 0;

        // Use synchronized block or CopyOnWriteArrayList if roads list could change
        // For simplicity, assuming roads list is fixed after construction.
        for (Road road : roads) {
             // Access vehicles safely - consider using synchronized block or concurrent list in Road
             List<Vehicle> currentRoadVehicles = new ArrayList<>(road.getVehicles()); // Copy to avoid issues if list changes during iteration
             currentVehicleCount += currentRoadVehicles.size();
            switch (road.getName()) {
                case NORTH: northCount = currentRoadVehicles.size(); break;
                case SOUTH: southCount = currentRoadVehicles.size(); break;
                case EAST:  eastCount = currentRoadVehicles.size(); break;
                case WEST:  westCount = currentRoadVehicles.size(); break;
            }
            for (Vehicle v : currentRoadVehicles) {
                // Check if vehicle is actually waiting at a light or behind another car
                 if (!v.isMoving()) { // Simplified: assume !isMoving means waiting
                    totalWaitTime += v.getWaitTime();
                    waitingVehiclesCount++;
                }
            }
        }

        // Calculate average wait time in seconds (convert from ms if deltaTime is ms)
        double avgWaitTimeSeconds = (waitingVehiclesCount > 0) ? (totalWaitTime / waitingVehiclesCount) / 1000.0 : 0;

        // Calculate average emergency response time
        double avgEmergencyResponse = 0;
        // Use synchronized block when iterating over the synchronized list
        synchronized (emergencyResponseTimes) {
             if (!emergencyResponseTimes.isEmpty()) {
                avgEmergencyResponse = emergencyResponseTimes.stream()
                                            .mapToDouble(Double::doubleValue)
                                            .average()
                                            .orElse(0.0);
             }
        }


        // Get last emergency clearance time
        Double lastEmergencyClearance = null;
         synchronized (emergencyResponseTimes) {
            if (!emergencyResponseTimes.isEmpty()) {
                lastEmergencyClearance = emergencyResponseTimes.get(emergencyResponseTimes.size() - 1);
            }
         }


        // Create and return Stats object
        return new Stats(
                this.totalVehicleCount + currentVehicleCount, // totalVehicles tracks vehicles that *have passed*
                avgWaitTimeSeconds,
                Map.of( // Using an immutable map
                    RoadDirection.NORTH, northCount,
                    RoadDirection.SOUTH, southCount,
                    RoadDirection.EAST, eastCount,
                    RoadDirection.WEST, westCount
                ),
                avgEmergencyResponse,
                lastEmergencyClearance);
    }

     // Inner class/record for Stats - better than defining a separate file for simple data structure
     // Record is immutable by default (Java 16+)
    public record Stats(
        long totalVehicles, // Total vehicles that have passed through + currently on road
        double avgWaitTime,
        Map<RoadDirection, Integer> vehiclesByDirection, // Currently on road by direction
        double avgEmergencyResponse,
        Double lastEmergencyClearance // Use Double for nullability
    ) {}

}