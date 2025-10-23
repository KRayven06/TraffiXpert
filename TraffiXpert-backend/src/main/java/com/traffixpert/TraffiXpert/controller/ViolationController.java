package com.traffixpert.TraffiXpert.controller;

import com.traffixpert.TraffiXpert.model.Violation;
import com.traffixpert.TraffiXpert.dto.ViolationDTO; // Import the new DTO
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
@RequestMapping("/api/violations") // Base path for violation endpoints
@CrossOrigin(origins = "http://localhost:9002") // Allow frontend access
public class ViolationController {

    private final SimulationService simulationService;
    // Define the desired time format
    private static final DateTimeFormatter DTO_TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm:ss");

    @Autowired
    public ViolationController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    /**
     * Endpoint to get the list of recent violations.
     * Accessed via GET request to /api/violations
     * @return A list of ViolationDTO objects with formatted time.
     */
    @GetMapping
    public List<ViolationDTO> getRecentViolations() {
        // Get the raw events from the service
        List<Violation> rawViolations = simulationService.getViolations();

        // Map and format them into DTOs
        return rawViolations.stream()
                .map(violation -> new ViolationDTO( // Map to DTO
                        violation.getId(),
                        violation.getTime().format(DTO_TIME_FORMATTER), // Format the time here
                        violation.getLocation(),
                        violation.getType(),
                        violation.getFine()))
                .collect(Collectors.toList());
    }

    // --- We might add POST /api/violations/ai/detect later ---
}