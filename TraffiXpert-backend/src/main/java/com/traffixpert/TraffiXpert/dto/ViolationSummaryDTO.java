package com.traffixpert.TraffiXpert.dto;

// Represents the summary of one type of violation for the report input
public record ViolationSummaryDTO(
        String type,
        int count
) {}
