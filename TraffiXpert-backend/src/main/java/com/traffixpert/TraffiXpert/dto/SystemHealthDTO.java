package com.traffixpert.TraffiXpert.dto;

import java.util.Map;

public record SystemHealthDTO(
        String overallStatus, // "healthy", "degraded", "down"
        Map<String, String> components // key: Component Name, value: status (online, offline, etc.)
) {
}
