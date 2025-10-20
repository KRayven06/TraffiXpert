package com.traffixpert.TraffiXpert.controller;

import com.traffixpert.TraffiXpert.dto.GenerateDailyReportInputDTO;
import com.traffixpert.TraffiXpert.dto.GenerateDailyReportOutputDTO;
import com.traffixpert.TraffiXpert.service.ReportService; // Import the new service
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*; // Import RequestBody

@RestController
@RequestMapping("/api/ai") // Base path for AI-related endpoints
@CrossOrigin(origins = "http://localhost:9002") // Allow frontend access
public class AiController {

    private final ReportService reportService;

    @Autowired
    public AiController(ReportService reportService) {
        this.reportService = reportService;
    }

    /**
     * Endpoint to generate the daily traffic report.
     * Accessed via POST request to /api/ai/generate-report
     * Expects GenerateDailyReportInputDTO in the request body.
     * @param reportInput The input data deserialized from the JSON request body.
     * @return GenerateDailyReportOutputDTO containing the report.
     */
    @PostMapping("/generate-report")
    public ResponseEntity<GenerateDailyReportOutputDTO> generateDailyReport(
            @RequestBody GenerateDailyReportInputDTO reportInput) { // Use @RequestBody

        try {
            GenerateDailyReportOutputDTO reportOutput = reportService.generateReport(reportInput);
            return ResponseEntity.ok(reportOutput); // Return 200 OK with the report
        } catch (Exception e) {
            // Basic error handling - log the error and return a server error status
            System.err.println("Error generating report: " + e.getMessage()); // Replace with proper logging
            // Consider returning a more specific error DTO if needed
            return ResponseEntity.internalServerError().build(); // Return 500 Internal Server Error
        }
    }

    // --- Add other AI endpoints later (e.g., detect-violation) ---
}
