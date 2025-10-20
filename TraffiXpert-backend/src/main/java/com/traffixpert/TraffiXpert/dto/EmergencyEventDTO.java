package com.traffixpert.TraffiXpert.dto;

// DTO for sending EmergencyEvent data to the frontend
public record EmergencyEventDTO(
        String id,
        String time, // Formatted time string
        String type,
        double clearanceTime
) {}
