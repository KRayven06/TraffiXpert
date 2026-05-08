package com.traffixpert.TraffiXpert.dto;

/**
 * DTO representing a point-in-time congestion snapshot for a road segment.
 * Used for analytics and historical congestion trend analysis.
 */
public record CongestionSnapshotDTO(
        String segmentId,
        String timestamp,             // ISO 8601 formatted timestamp
        double congestionIndex,       // Normalized 0.0 - 1.0
        char levelOfService,          // 'A' through 'F'
        int activeVehicleCount,
        double averageSpeed,          // km/h
        double averageDelay,          // seconds per vehicle
        int queueLength               // number of vehicles in queue
) {}
