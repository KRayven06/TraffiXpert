package com.traffixpert.TraffiXpert.service;

import com.traffixpert.TraffiXpert.dto.GenerateDailyReportInputDTO;
import com.traffixpert.TraffiXpert.dto.GenerateDailyReportOutputDTO;
import com.traffixpert.TraffiXpert.dto.ViolationSummaryDTO; // Import needed
import org.springframework.stereotype.Service;

import java.util.ArrayList; // Import needed
import java.util.List;
import java.util.stream.Collectors; // Import needed

@Service
public class ReportService {

    /**
     * Generates a daily traffic report based on input statistics.
     * Simulates AI response based on input values.
     * TODO: Implement actual AI logic here later.
     * @param input DTO containing daily stats (total vehicles, avg wait time, violations).
     * @return DTO containing the report summary and recommendations.
     */
    public GenerateDailyReportOutputDTO generateReport(GenerateDailyReportInputDTO input) {
        // --- Simulated Logic ---
        System.out.println("AI Report Simulation: Received input - " + input);

        // Build dynamic summary
        StringBuilder summaryBuilder = new StringBuilder();
        summaryBuilder.append(String.format("Daily Summary: %,d vehicles processed. ", input.totalVehicles()));

        if (input.avgWaitTime() < 20.0) {
            summaryBuilder.append(String.format("Average wait time was excellent at %.1fs. ", input.avgWaitTime()));
        } else if (input.avgWaitTime() < 45.0) {
            summaryBuilder.append(String.format("Average wait time was moderate at %.1fs. ", input.avgWaitTime()));
        } else {
            summaryBuilder.append(String.format("Average wait time was high at %.1fs, suggesting congestion. ", input.avgWaitTime()));
        }

        long totalViolations = input.violations().stream().mapToLong(ViolationSummaryDTO::count).sum();
        if (totalViolations == 0) {
            summaryBuilder.append("No violations were recorded.");
        } else {
            summaryBuilder.append(String.format("%d total violations recorded across %d types.", totalViolations, input.violations().size()));
        }
        String summary = summaryBuilder.toString();


        // Build dynamic recommendations
        List<String> recommendations = new ArrayList<>();
        recommendations.add("Simulated Rec: Continue monitoring overall system performance.");

        if (input.avgWaitTime() > 40.0) {
            recommendations.add("Simulated Rec: Average wait time is high. Review signal timings during peak hours observed.");
        }

        if (!input.violations().isEmpty()) {
            // Find violation type with highest count
             input.violations().stream()
                 .max((v1, v2) -> Integer.compare(v1.count(), v2.count()))
                 .ifPresent(maxViolation -> {
                     if (maxViolation.count() > 3) { // Only recommend if count is significant
                         recommendations.add(String.format("Simulated Rec: Focus enforcement or review signal phase for '%s' violations.", maxViolation.type()));
                     }
                 });
        } else {
             recommendations.add("Simulated Rec: Violation rates are low, maintain current monitoring.");
        }

        // Ensure we don't exceed 3 recommendations for brevity
        List<String> finalRecommendations = recommendations.stream().limit(3).collect(Collectors.toList());


        System.out.println("AI Report Simulation: Generated output - Summary: " + summary + ", Recommendations: " + finalRecommendations);

        return new GenerateDailyReportOutputDTO(summary, finalRecommendations);
        // --- End Simulated Logic ---
    }
}