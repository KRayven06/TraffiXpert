package com.traffixpert.TraffiXpert.service;

import com.traffixpert.TraffiXpert.dto.DetectViolationInputDTO;
import com.traffixpert.TraffiXpert.dto.DetectViolationOutputDTO;
import org.springframework.stereotype.Service;
import java.util.Random;

@Service
public class ViolationService {

    private final Random random = new Random(); // Keep random for confidence variation

    /**
     * Placeholder method to simulate AI violation detection from an image Data URL.
     * Simulates based on image data length for testing purposes.
     * TODO: Implement actual AI image analysis logic here.
     * @param input DTO containing the image Data URL.
     * @return DTO indicating if a violation was detected.
     */
    public DetectViolationOutputDTO detectViolationFromImage(DetectViolationInputDTO input) {
        // --- Placeholder Logic ---
        System.out.println("AI Simulation: Received image data URL (length): " + (input.imageUrl() != null ? input.imageUrl().length() : 0));

        boolean hasViolation = false;
        String violationType = null;
        // Start with lower confidence for non-violations
        double confidence = 0.3 + random.nextDouble() * 0.2; // e.g., 0.3 to 0.5

        // Simulate: Detect violation if image data is "large" (arbitrary threshold)
        if (input.imageUrl() != null && input.imageUrl().length() > 500000) { // Example threshold: 500,000 characters
            hasViolation = true;
            // Alternate violation type based on length parity for variety
            violationType = (input.imageUrl().length() % 2 == 0) ? "Red Light" : "Speeding";
            // Higher confidence for detected violations
            confidence = 0.75 + random.nextDouble() * 0.2; // e.g., 0.75 to 0.95
        }

        // Ensure confidence doesn't exceed 1.0
        confidence = Math.min(confidence, 1.0);

        System.out.printf("AI Simulation Result: hasViolation=%b, type=%s, confidence=%.2f%n",
                          hasViolation, violationType, confidence);

        return new DetectViolationOutputDTO(hasViolation, violationType, confidence);
        // --- End Placeholder Logic ---
    }

    // Add other violation-related methods if needed (e.g., getting violations from DB)
}