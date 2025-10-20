package com.traffixpert.TraffiXpert.dto;

import com.traffixpert.TraffiXpert.model.VehicleColor; // Use the enum
import com.traffixpert.TraffiXpert.model.VehicleType; // Use the enum

// Represents the data needed by the frontend for a single vehicle
public record VehicleDTO(
        long id,
        double x,
        double y,
        double width,
        double height,
        double angle,
        VehicleColor color, // Use Enum
        VehicleType type // Use Enum
) {}
