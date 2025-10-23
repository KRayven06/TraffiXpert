package com.traffixpert.TraffiXpert.dto;

// DTO for sending Violation data to the frontend
public record ViolationDTO(
        String id,
        String time, // Formatted time string
        String location,
        String type,
        String fine
) {}