package com.traffixpert.TraffiXpert.controller;

import com.traffixpert.TraffiXpert.model.SignalState;
import com.traffixpert.TraffiXpert.service.SimulationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity; // Import ResponseEntity
import org.springframework.web.bind.annotation.*; // Import GET mapping etc.

import java.util.Map; // Import Map for status response


@RestController
@RequestMapping("/api/control") // Base path for control actions
@CrossOrigin(origins = "http://localhost:9002") // Allow frontend access
public class ControlController {

    private final SimulationService simulationService;

    @Autowired
    public ControlController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    /**
     * Endpoint to toggle the automatic traffic signal mode.
     * Accessed via POST request to /api/control/mode/toggle
     * @return ResponseEntity indicating success (HTTP 200 OK).
     */
    @PostMapping("/mode/toggle")
    public ResponseEntity<Void> toggleAutoMode() {
        simulationService.toggleAutoMode();
        // Return HTTP 200 OK with no body
        return ResponseEntity.ok().build();
    }

    /**
     * Endpoint to set all traffic signals to RED.
     * Accessed via POST request to /api/control/stop
     * @return ResponseEntity indicating success (HTTP 200 OK).
     */
    @PostMapping("/stop")
    public ResponseEntity<Void> stopAllTraffic() {
        simulationService.setAllSignals(SignalState.RED); // Set all to RED
        // simulationService.toggleAutoMode(); // Removed - Stop shouldn't necessarily disable auto mode logic? Decide behavior.
        // If stop should also pause the simulation loop:
        // simulationService.stopSimulationLoop();
        return ResponseEntity.ok().build();
    }

    /**
     * Endpoint to trigger an emergency vehicle sequence.
     * Accessed via POST request to /api/control/emergency/trigger
     * @return ResponseEntity indicating success (HTTP 200 OK).
     */
    @PostMapping("/emergency/trigger")
    public ResponseEntity<Void> triggerEmergency() {
        simulationService.triggerEmergency();
        return ResponseEntity.ok().build();
    }

    // --- NEW: Endpoints for Simulation Loop Control ---

    /**
     * Endpoint to start/resume the simulation loop.
     * Accessed via POST request to /api/control/start
     * @return ResponseEntity indicating success.
     */
    @PostMapping("/start")
    public ResponseEntity<Void> startSimulation() {
        simulationService.startSimulationLoop();
        return ResponseEntity.ok().build();
    }

    /**
     * Endpoint to pause the simulation loop.
     * Accessed via POST request to /api/control/stop-simulation (renamed to avoid conflict)
     * @return ResponseEntity indicating success.
     */
    @PostMapping("/stop-simulation") // Renamed endpoint
    public ResponseEntity<Void> stopSimulation() {
        simulationService.stopSimulationLoop();
        return ResponseEntity.ok().build();
    }

    /**
     * Endpoint to get the current running status of the simulation.
     * Accessed via GET request to /api/control/status
     * @return ResponseEntity containing the running status.
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Boolean>> getSimulationStatus() {
        boolean isRunning = simulationService.isSimulationRunning();
        return ResponseEntity.ok(Map.of("isRunning", isRunning));
    }
}