package com.traffixpert.TraffiXpert.dto;

import java.util.List;

// Represents the overall state needed for the live map
public record SimulationStateDTO(
        List<TrafficSignalDTO> signals, // List of signal states
        List<VehicleDTO> vehicles // Flattened list of all vehicles
) {}
