package com.traffixpert.TraffiXpert.controller;

import com.traffixpert.TraffiXpert.dto.SystemHealthDTO;
import com.traffixpert.TraffiXpert.service.SimulationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/system")
public class SystemController {

    private final SimulationService simulationService;

    @Autowired
    public SystemController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    /**
     * Endpoint to check the health of system components.
     * Accessed via GET request to /api/system/health
     */
    @GetMapping("/health")
    public ResponseEntity<SystemHealthDTO> getSystemHealth() {
        Map<String, String> components = new HashMap<>();
        boolean isHealthy = true;

        // 1. Check Simulation Engine
        boolean isSimRunning = simulationService.isSimulationRunning();
        components.put("Simulation Engine", isSimRunning ? "online" : "offline");
        if (!isSimRunning)
            isHealthy = false;

        // 2. Check Database / API (Implicitly online if this request succeeds)
        // In a real app, we'd ping the DB repository here.
        components.put("Database Connection", "online");

        // 3. Check AI Modules (Mocked check for now, assuming available if service is
        // up)
        components.put("AI Violation Detection", "online");
        components.put("Intersection Sensors", "online"); // Mocked hardware status

        // Determine overall status
        String overallStatus = isHealthy ? "healthy" : "degraded";

        return ResponseEntity.ok(new SystemHealthDTO(overallStatus, components));
    }
}
