package com.traffixpert.TraffiXpert.dto;

import java.util.List;

// Represents the output (the generated report) sent back to the frontend
public record GenerateDailyReportOutputDTO(
        String summary,
        List<String> recommendations
) {}
