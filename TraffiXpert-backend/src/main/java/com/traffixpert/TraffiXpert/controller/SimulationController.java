package com.traffixpert.TraffiXpert.controller;

import com.traffixpert.TraffiXpert.dto.SimulationStateDTO;
import com.traffixpert.TraffiXpert.dto.TrafficSignalDTO;
import com.traffixpert.TraffiXpert.dto.VehicleDTO;
import com.traffixpert.TraffiXpert.model.Road;
import com.traffixpert.TraffiXpert.model.TrafficSignal;
import com.traffixpert.TraffiXpert.model.Vehicle;
import com.traffixpert.TraffiXpert.service.SimulationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController // Marks this class as a REST controller
@RequestMapping("/api/simulation") // Base path for all endpoints in this controller
@CrossOrigin(origins = "http://localhost:9002") // Allow requests from your Next.js dev server
public class SimulationController {

    private final SimulationService simulationService;

    // Constructor Injection: Spring automatically provides the SimulationService instance
    @Autowired
    public SimulationController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    /**
     * Endpoint to get the current state of the simulation (signals and vehicles).
     * Accessed via GET request to /api/simulation/state
     * @return SimulationStateDTO containing lists of signals and vehicles.
     */
    @GetMapping("/state")
    public SimulationStateDTO getSimulationState() {
        // Get current signals and map them to DTOs
        List<TrafficSignalDTO> signalDTOs = simulationService.getSignals()
                .stream()
                .map(signal -> new TrafficSignalDTO(signal.getState())) // Create DTO
                .collect(Collectors.toList());

        // Get all vehicles from all roads and map them to DTOs
        List<VehicleDTO> vehicleDTOs = simulationService.getRoads()
                .stream()
                .flatMap(road -> road.getVehicles().stream()) // Flatten list of lists
                .map(vehicle -> new VehicleDTO( // Create DTO
                        vehicle.getId(),
                        vehicle.getX(),
                        vehicle.getY(),
                        vehicle.getWidth(),
                        vehicle.getHeight(),
                        vehicle.getAngle(),
                        vehicle.getColor(),
                        vehicle.getType()))
                .collect(Collectors.toList());

        // Return the combined state in a DTO
        return new SimulationStateDTO(signalDTOs, vehicleDTOs);
    }

     // --- Add other simulation-related endpoints later ---
     // e.g., POST endpoints to control the simulation (toggle mode, trigger emergency)
}
