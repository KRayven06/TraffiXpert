package com.traffixpert.TraffiXpert.dto;

import com.traffixpert.TraffiXpert.model.SignalState; // Use the enum

// Represents the data needed by the frontend for a traffic signal
public record TrafficSignalDTO(
        SignalState state // Just the state is needed by the frontend map - REMOVED COMMA
        // double timer // Optional: include if frontend needs the timer value
) {}
