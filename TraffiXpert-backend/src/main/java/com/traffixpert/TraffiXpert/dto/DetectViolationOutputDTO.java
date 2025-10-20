package com.traffixpert.TraffiXpert.dto;

// Represents the output from the violation detection process
public record DetectViolationOutputDTO(
        boolean hasViolation,
        String violationType, // Can be null if no violation
        Double confidence      // Use Double object type to allow null if needed, though placeholder generates a value
) {}
