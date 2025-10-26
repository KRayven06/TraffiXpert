package com.traffixpert.TraffiXpert.service; // Adjust package name if needed

import com.traffixpert.TraffiXpert.model.*; // Import model classes
import org.springframework.stereotype.Service; // Import Spring Service annotation

import jakarta.annotation.PostConstruct; // Import for PostConstruct
import jakarta.annotation.PreDestroy; // Import for PreDestroy
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.Duration; // Import Duration
import java.time.Instant; // Import Instant
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*; // Import concurrent package
import java.util.concurrent.atomic.AtomicInteger; // Import AtomicInteger
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors; // Import Collectors
import java.util.Random; // Add Random import

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

    // --- Simulation Loop Control ---
    private volatile boolean isRunning = false; // volatile for thread safety
    private ScheduledExecutorService scheduler;
    private ScheduledFuture<?> simulationTaskFuture;
    private static final long UPDATE_INTERVAL_MS = 50; // Approx 20 FPS

    // --- Incident Tracking ---
    private final AtomicInteger incidentCount = new AtomicInteger(0); // Thread-safe counter for incidents

    // --- Data Logging ---
    private final ConcurrentLinkedDeque<Violation> violations = new ConcurrentLinkedDeque<>();
    // --- MODIFIED: Use Map for easy update of EmergencyEvent ---
    private final ConcurrentHashMap<String, EmergencyEvent> emergencyLogMap = new ConcurrentHashMap<>();
    private final ConcurrentLinkedDeque<String> emergencyLogOrder = new ConcurrentLinkedDeque<>(); // To maintain order & size limit
    private final List<Double> emergencyResponseTimes = Collections.synchronizedList(new ArrayList<>());
    private long totalVehicleCount = 0; // Cumulative count of vehicles that have passed

    private static final int MAX_LOG_SIZE = 1000;
    private static final AtomicLong violationIdCounter = new AtomicLong(0);
    private static final AtomicLong emergencyIdCounter = new AtomicLong(0);
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm:ss");

    // --- NEW: Tracking current emergency vehicle ---
    private volatile Long currentEmergencyVehicleId = null; // ID of the active emergency vehicle
    private volatile Instant currentEmergencyStartTime = null; // Time it was spawned

    // --- NEW: Emergency types and randomizer ---
    private static final String[] EMERGENCY_TYPES = {"Ambulance", "Firetruck", "Police Car"}; // Add types
    private final Random random = new Random(); // Add Random instance


    // Enum for AutoModeState, mirroring TS logic
     private enum AutoModeState {
        N_GREEN, N_YELLOW, S_GREEN, S_YELLOW, E_GREEN, E_YELLOW, W_GREEN, W_YELLOW
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
        // startSimulationLoop(); // Called via @PostConstruct now
    }

    // --- Start simulation on bean initialization ---
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
                 System.out.println("Emergency timer expired.");
                 // Check if emergency vehicle is still tracked (meaning it hasn't exited yet)
                 if(this.currentEmergencyVehicleId != null) {
                    System.out.println("Emergency ended by timer, but vehicle " + this.currentEmergencyVehicleId + " may still be present.");
                    // Optionally force-record clearance time based on timer expiry here if needed
                 }
                this.isEmergency = false;
                this.currentEmergencyVehicleId = null; // Clear tracked vehicle when timer ends anyway
                this.currentEmergencyStartTime = null;
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
             e.printStackTrace(); // Print stack trace for debugging
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
        } else {
             System.out.println("Switched to Manual Mode. Signals remain in current state until changed.");
             // Optionally set all to RED or another default manual state
             // setAllSignals(SignalState.RED);
        }
    }

    /**
     * Sets all traffic signals to the specified state.
     * @param state The SignalState to set all signals to.
     */
    public void setAllSignals(SignalState state) {
         this.signals.forEach(s -> s.setState(state));
    }

    /**
     * Triggers an emergency sequence.
     * Stores start time and vehicle ID.
     */
    public void triggerEmergency() {
        if (this.isEmergency) {
             System.out.println("Emergency sequence already active.");
             return;
        }

        this.isEmergency = true;
        this.isAutoMode = false; // Disable auto mode
        this.emergencyTimer = 15000; // Max duration / fallback timer
        this.incidentCount.incrementAndGet();

        // *** MODIFIED: Select random emergency type ***
        String selectedEmergencyType = EMERGENCY_TYPES[random.nextInt(EMERGENCY_TYPES.length)];

        // Spawn emergency vehicle
        int emergencyRoadIndex = ThreadLocalRandom.current().nextInt(this.roads.size());
        Road emergencyRoad = this.roads.get(emergencyRoadIndex);

        // *** Use the constructor that accepts the type ***
        Vehicle emergencyVehicle = new Vehicle(emergencyRoad, VehicleType.EMERGENCY, selectedEmergencyType);

        emergencyRoad.addVehicleToFront(emergencyVehicle);

        // Store emergency vehicle details
        this.currentEmergencyVehicleId = emergencyVehicle.getId();
        this.currentEmergencyStartTime = Instant.now();
        System.out.println("Emergency Triggered. Type: " + selectedEmergencyType + ". Vehicle ID: " + this.currentEmergencyVehicleId + " on road " + emergencyRoad.getName() + " at " + this.currentEmergencyStartTime);

        // Set signals to clear path (Green for entry and opposing for straight through)
        for (int i = 0; i < this.signals.size(); i++) {
            boolean isEmergencyRoad = i == emergencyRoadIndex;
            boolean isOpposingRoad = (emergencyRoad.getName() == RoadDirection.NORTH && i == 1) || // North -> South
                                     (emergencyRoad.getName() == RoadDirection.SOUTH && i == 0) || // South -> North
                                     (emergencyRoad.getName() == RoadDirection.EAST && i == 3) ||  // East -> West
                                     (emergencyRoad.getName() == RoadDirection.WEST && i == 2);   // West -> East

            this.signals.get(i).setState((isEmergencyRoad || isOpposingRoad) ? SignalState.GREEN : SignalState.RED);
        }

        // Log initial event (clearance time TBD)
        String eventId = "EV-" + emergencyIdCounter.getAndIncrement();
        EmergencyEvent event = new EmergencyEvent(
            eventId,
            LocalTime.now(),
            // *** MODIFIED: Use selected type in log ***
            selectedEmergencyType,
            0.0 // Clearance time initially 0, will be updated
        );
        // Add to map and ordered list (logic remains the same)
        emergencyLogMap.put(eventId, event);
        emergencyLogOrder.addFirst(eventId);
        // Trim logs if necessary
        while (emergencyLogOrder.size() > MAX_LOG_SIZE) {
            String oldestId = emergencyLogOrder.pollLast();
            if (oldestId != null) {
                emergencyLogMap.remove(oldestId);
            }
        }
        // Don't add to response times yet
    }


    /**
     * Called by Road when a specific vehicle exits.
     * Calculates the duration if it's the tracked emergency vehicle and updates the log/stats.
     * @param vehicleId The ID of the vehicle that exited.
     */
     public synchronized void recordVehicleExit(long vehicleId) {
         // Check if this is the currently tracked emergency vehicle
         if (this.currentEmergencyVehicleId != null && vehicleId == this.currentEmergencyVehicleId) {
             System.out.println("Tracked Emergency Vehicle exited: ID " + vehicleId);
             if (this.currentEmergencyStartTime != null) {
                 // Calculate duration
                 Duration duration = Duration.between(this.currentEmergencyStartTime, Instant.now());
                 double clearanceTimeSeconds = duration.toMillis() / 1000.0;
                 System.out.printf("Actual Clearance Time: %.1fs%n", clearanceTimeSeconds);

                 // Update the log entry (find the latest entry)
                 String latestEventId = emergencyLogOrder.peekFirst();
                 if (latestEventId != null) {
                     EmergencyEvent event = emergencyLogMap.get(latestEventId);
                     // Check if this log entry is indeed the one for the *current* emergency
                     // (Simple check: is clearance time still 0?)
                     if (event != null && event.getClearanceTime() == 0.0) {
                         event.setClearanceTime(clearanceTimeSeconds); // Update the existing event
                         System.out.println("Updated EmergencyEvent log ID " + latestEventId + " with clearance time.");
                     } else if (event != null) {
                        System.out.println("Warning: Latest emergency log entry already had clearance time set or was null for ID " + latestEventId);
                     } else {
                         System.err.println("Error: Could not find event in map for latest log ID " + latestEventId);
                     }
                 } else {
                     System.err.println("Error: Emergency log order is empty, cannot update clearance time.");
                 }

                 // Add accurate time to response times
                 emergencyResponseTimes.add(clearanceTimeSeconds);

                 // Clear tracking variables - IMPORTANT
                 this.currentEmergencyVehicleId = null;
                 this.currentEmergencyStartTime = null;

                 // Optionally: End emergency state early if desired and reset signals/mode
                 // this.isEmergency = false;
                 // this.emergencyTimer = 0; // Reset timer too
                 // this.isAutoMode = true; // Resume auto mode immediately
                 // this.autoModeState = AutoModeState.N_YELLOW; // Or similar transition
                 // this.autoModeTimer = 2000;

             } else {
                 System.err.println("Error: Emergency vehicle exited but start time was not recorded.");
                 // Clear potentially stale ID anyway
                 this.currentEmergencyVehicleId = null;
             }
         }
         // Increment total vehicle count for *any* vehicle exiting
         incrementTotalVehicleCount(1);
     }


    /**
     * Adds a violation record to the log.
     * @param roadNameString The name of the road where the violation occurred.
     */
    public void addViolation(String roadNameString) {
        String id = "V-" + violationIdCounter.getAndIncrement();
        LocalTime time = LocalTime.now();
        String location = roadNameString.substring(0, 1).toUpperCase() + roadNameString.substring(1).toLowerCase() + "bound";
        String type = "Red Light";
        String fine = "$150";
        Violation violation = new Violation(id, time, location, type, fine);
        violations.addFirst(violation);
        if (violations.size() > MAX_LOG_SIZE) {
            violations.pollLast();
        }
    }


     /**
     * Increments the total count of vehicles that have passed through.
     * Called by recordVehicleExit now.
     * @param count Number of vehicles that exited.
     */
    public synchronized void incrementTotalVehicleCount(int count) {
        // This count now strictly represents vehicles that have *left* the simulation area
        this.totalVehicleCount += count;
    }


    // --- Simulation Control Methods ---
    /** Starts the simulation update loop if not already running. */
    public synchronized void startSimulationLoop() {
        if (!isRunning) {
            isRunning = true;
            lastTime = System.nanoTime(); // Reset timer when starting/resuming
            simulationTaskFuture = scheduler.scheduleAtFixedRate(this::update, 0, UPDATE_INTERVAL_MS, TimeUnit.MILLISECONDS);
            System.out.println("Simulation loop started.");
        } else {
             System.out.println("Simulation loop already running.");
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
        } else {
             System.out.println("Simulation loop already stopped.");
        }
    }

    /** Cleans up the scheduler when the application shuts down. */
    @PreDestroy
    public void shutdownScheduler() {
        stopSimulationLoop();
        if (scheduler != null && !scheduler.isShutdown()) {
            scheduler.shutdown();
            try {
                if (!scheduler.awaitTermination(2, TimeUnit.SECONDS)) { // Increased wait time
                    System.err.println("Scheduler did not terminate gracefully, forcing shutdown.");
                    scheduler.shutdownNow();
                }
            } catch (InterruptedException ie) {
                System.err.println("Scheduler shutdown interrupted.");
                scheduler.shutdownNow();
                Thread.currentThread().interrupt();
            }
            System.out.println("Simulation scheduler shut down.");
        }
    }


    // --- Getters for State ---
    public int getIncidentCount() { return this.incidentCount.get(); }
    public boolean isSimulationRunning() { return isRunning; }
    public List<TrafficSignal> getSignals() { return Collections.unmodifiableList(signals); } // Return unmodifiable view
    public List<Road> getRoads() { return Collections.unmodifiableList(roads); } // Return unmodifiable view
    public boolean isAutoMode() { return isAutoMode; }
    public boolean isEmergency() { return isEmergency; }
    public List<Violation> getViolations() { return new ArrayList<>(violations); } // Return copy

     // --- getEmergencyLog now reads from map based on order ---
     public List<EmergencyEvent> getEmergencyLog() {
         // Create a list from the ordered IDs, fetching from the map
         return emergencyLogOrder.stream()
                 .map(emergencyLogMap::get)
                 .filter(java.util.Objects::nonNull) // Filter out potential nulls if map/list get out of sync
                 .collect(Collectors.toList()); // Collect into a new list
     }

    /**
     * Calculates and returns the current simulation statistics.
     * @return A Stats object containing current metrics.
     */
    public Stats getStats() {
        double totalWaitTime = 0;
        int waitingVehiclesCount = 0;
        int currentNorth = 0, currentSouth = 0, currentEast = 0, currentWest = 0;
        long currentTotalOnRoad = 0;

        // Iterate safely over roads (assuming roads list doesn't change)
        for (Road road : roads) {
             List<Vehicle> currentRoadVehicles = road.getVehicles(); // Gets a safe copy now
             int roadVehicleCount = currentRoadVehicles.size();
             currentTotalOnRoad += roadVehicleCount;

             // Assign counts based on road name
             switch (road.getName()) {
                 case NORTH: currentNorth = roadVehicleCount; break;
                 case SOUTH: currentSouth = roadVehicleCount; break;
                 case EAST:  currentEast  = roadVehicleCount; break;
                 case WEST:  currentWest  = roadVehicleCount; break;
             }

             // Calculate wait times for vehicles on this road
             for (Vehicle v : currentRoadVehicles) {
                 if (!v.isMoving()) {
                    totalWaitTime += v.getWaitTime();
                    waitingVehiclesCount++;
                 }
             }
        }

        double avgWaitTimeSeconds = (waitingVehiclesCount > 0) ? (totalWaitTime / waitingVehiclesCount) / 1000.0 : 0;

        double avgEmergencyResponse = 0;
        synchronized (emergencyResponseTimes) {
             if (!emergencyResponseTimes.isEmpty()) {
                avgEmergencyResponse = emergencyResponseTimes.stream()
                                            .mapToDouble(Double::doubleValue)
                                            .average()
                                            .orElse(0.0);
             }
        }

        // Get last *recorded* (accurate) clearance time from the log map
        Double lastEmergencyClearance = null;
        String lastEventId = emergencyLogOrder.peekFirst(); // Get the ID of the most recent event
        if (lastEventId != null) {
            EmergencyEvent lastEvent = emergencyLogMap.get(lastEventId);
            // Only report if it has a non-zero (updated) clearance time
            if (lastEvent != null && lastEvent.getClearanceTime() > 0.0) {
                 lastEmergencyClearance = lastEvent.getClearanceTime();
            }
        }


        // totalVehicles should represent vehicles *processed*, not current count
        long reportedTotalVehicles = this.totalVehicleCount; // Use the counter incremented on exit

        return new Stats(
                reportedTotalVehicles,
                avgWaitTimeSeconds,
                Map.of( // Map still represents *current* vehicles on each road
                    RoadDirection.NORTH, currentNorth,
                    RoadDirection.SOUTH, currentSouth,
                    RoadDirection.EAST, currentEast,
                    RoadDirection.WEST, currentWest
                ),
                avgEmergencyResponse,
                lastEmergencyClearance);
    }

     // Inner record for Stats
     public record Stats(
        long totalVehicles, // Total vehicles that have passed *through* simulation
        double avgWaitTime, // Average wait time for *currently* waiting vehicles
        Map<RoadDirection, Integer> vehiclesByDirection, // *Currently* on road by direction
        double avgEmergencyResponse, // Average of *completed* emergency clearances
        Double lastEmergencyClearance // Last *completed* emergency clearance time
    ) {}
}