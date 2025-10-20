package com.traffixpert.TraffiXpert.controller;

// Import the new DTO
import com.traffixpert.TraffiXpert.dto.EmergencyEventDTO;
import com.traffixpert.TraffiXpert.model.EmergencyEvent;
import com.traffixpert.TraffiXpert.service.SimulationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.format.DateTimeFormatter; // Import Formatter
import java.util.List;
import java.util.stream.Collectors; // Import Collectors

@RestController
@RequestMapping("/api/emergency") // Base path for emergency endpoints
@CrossOrigin(origins = "http://localhost:9002") // Allow frontend access
public class EmergencyController {

    private final SimulationService simulationService;
    // Define the desired time format
    private static final DateTimeFormatter DTO_TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm:ss");

    @Autowired
    public EmergencyController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    /**
     * Endpoint to get the log of recent emergency events.
     * MODIFIED: Returns formatted DTO list.
     * Accessed via GET request to /api/emergency/log
     * @return A list of EmergencyEventDTO objects.
     */
    @GetMapping("/log")
    public List<EmergencyEventDTO> getEmergencyLog() {
        // Get the raw events from the service
        List<EmergencyEvent> rawEvents = simulationService.getEmergencyLog();

        // Map and format them into DTOs
        return rawEvents.stream()
                .map(event -> new EmergencyEventDTO(
                        event.getId(),
                        event.getTime().format(DTO_TIME_FORMATTER), // Format the time here
                        event.getType(),
                        event.getClearanceTime()))
                .collect(Collectors.toList());
    }

     // --- We might add POST /api/emergency/trigger later if needed separately from ControlController ---
     // The trigger logic is currently in ControlController's /api/control/emergency/trigger endpoint
}