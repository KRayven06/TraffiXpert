package com.traffixpert.TraffiXpert.controller;

import com.traffixpert.TraffiXpert.service.SimulationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
        // Directly return the Stats record obtained from the service
        return simulationService.getStats();
    }
}
