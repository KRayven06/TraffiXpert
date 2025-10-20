package com.traffixpert.TraffiXpert.controller;

import com.traffixpert.TraffiXpert.service.SimulationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity; // Import ResponseEntity
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map; // Import Map

@RestController
@RequestMapping("/api/stats") // Base path for stats endpoints
@CrossOrigin(origins = "http://localhost:9002") // Allow frontend access
public class StatsController {

    private final SimulationService simulationService;

    @Autowired
    public StatsController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    /**
     * Endpoint to get the current simulation statistics.
     * Accessed via GET request to /api/stats
     * @return The Stats record/object containing current metrics.
     */
    @GetMapping
    public SimulationService.Stats getCurrentStats() {
        return simulationService.getStats();
    }

    // --- NEW: Endpoint for Incident Count ---
    /**
     * Endpoint to get the current incident count.
     * Accessed via GET request to /api/stats/incidents
     * @return ResponseEntity containing the incident count.
     */
    @GetMapping("/incidents")
    public ResponseEntity<Map<String, Integer>> getIncidentCount() {
        int count = simulationService.getIncidentCount();
        return ResponseEntity.ok(Map.of("incidentCount", count));
    }
}