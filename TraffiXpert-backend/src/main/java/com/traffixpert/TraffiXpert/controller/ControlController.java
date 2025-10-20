package com.traffixpert.TraffiXpert.controller;

import com.traffixpert.TraffiXpert.model.SignalState;
import com.traffixpert.TraffiXpert.service.SimulationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity; // Import ResponseEntity
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
        simulationService.toggleAutoMode(); // Also turn off auto mode as per original logic
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
}
