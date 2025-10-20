package com.traffixpert.TraffiXpert.controller;

import com.traffixpert.TraffiXpert.model.Violation; // Import the model
import com.traffixpert.TraffiXpert.service.SimulationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/violations") // Base path for violation endpoints
@CrossOrigin(origins = "http://localhost:9002") // Allow frontend access
public class ViolationController {

    private final SimulationService simulationService;

    @Autowired
    public ViolationController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    /**
     * Endpoint to get the list of recent violations.
     * Accessed via GET request to /api/violations
     * @return A list of Violation objects.
     */
    @GetMapping
    public List<Violation> getRecentViolations() {
        // Get the current list of violations from the service
        return simulationService.getViolations();
    }

    // --- We might add POST /api/violations/ai/detect later ---
}
