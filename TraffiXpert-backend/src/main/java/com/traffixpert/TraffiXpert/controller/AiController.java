package com.traffixpert.TraffiXpert.controller;

import com.traffixpert.TraffiXpert.dto.DetectViolationInputDTO; // Import violation DTOs
import com.traffixpert.TraffiXpert.dto.DetectViolationOutputDTO;
import com.traffixpert.TraffiXpert.dto.GenerateDailyReportInputDTO;
import com.traffixpert.TraffiXpert.dto.GenerateDailyReportOutputDTO;
import com.traffixpert.TraffiXpert.service.ReportService;
import com.traffixpert.TraffiXpert.service.ViolationService; // Import ViolationService
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:9002")
public class AiController {

    private final ReportService reportService;
    private final ViolationService violationService; // Inject ViolationService

    // Constructor injection for both services
    @Autowired
    public AiController(ReportService reportService, ViolationService violationService) {
        this.reportService = reportService;
        this.violationService = violationService;
    }

    /**
     * Endpoint to generate the daily traffic report.
     * Accessed via POST request to /api/ai/generate-report
     */
    @PostMapping("/generate-report")
    public ResponseEntity<GenerateDailyReportOutputDTO> generateDailyReport(
            @RequestBody GenerateDailyReportInputDTO reportInput) {
        try {
            // Assumes reportService.generateReport exists and returns the output DTO
            GenerateDailyReportOutputDTO reportOutput = reportService.generateReport(reportInput);
            return ResponseEntity.ok(reportOutput);
        } catch (Exception e) {
            System.err.println("Error generating report: " + e.getMessage()); // Basic logging
            return ResponseEntity.internalServerError().build(); // Return 500
        }
    }

    /**
     * Endpoint to detect traffic violations from an image Data URL.
     * Accessed via POST request to /api/ai/detect-violation
     */
    @PostMapping("/detect-violation")
    public ResponseEntity<DetectViolationOutputDTO> detectTrafficViolation(
            @RequestBody DetectViolationInputDTO violationInput) { // Use @RequestBody
        try {
            // Assumes violationService.detectViolationFromImage exists and returns the output DTO
            DetectViolationOutputDTO result = violationService.detectViolationFromImage(violationInput);
            return ResponseEntity.ok(result); // Return 200 OK with the result
        } catch (Exception e) {
             System.err.println("Error detecting violation: " + e.getMessage()); // Basic logging
             return ResponseEntity.internalServerError().build(); // Return 500
        }
    }

}
