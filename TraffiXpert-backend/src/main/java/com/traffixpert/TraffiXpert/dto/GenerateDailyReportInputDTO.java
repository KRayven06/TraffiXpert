package com.traffixpert.TraffiXpert.dto;

import java.util.List;

// Represents the input data required to generate the daily report
public record GenerateDailyReportInputDTO(
        long totalVehicles,
        double avgWaitTime,
        List<ViolationSummaryDTO> violations
) {}
