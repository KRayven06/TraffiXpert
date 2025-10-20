package com.traffixpert.TraffiXpert.controller;

import com.traffixpert.TraffiXpert.model.EmergencyEvent; // Import the model
import com.traffixpert.TraffiXpert.service.SimulationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/emergency") // Base path for emergency endpoints
@CrossOrigin(origins = "http://localhost:9002") // Allow frontend access
public class EmergencyController {

    private final SimulationService simulationService;

    @Autowired
    public EmergencyController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    /**
     * Endpoint to get the log of recent emergency events.
     * Accessed via GET request to /api/emergency/log
     * @return A list of EmergencyEvent objects.
     */
    @GetMapping("/log")
    public List<EmergencyEvent> getEmergencyLog() {
        return simulationService.getEmergencyLog();
    }

     // --- We might add POST /api/emergency/trigger later ---
}
