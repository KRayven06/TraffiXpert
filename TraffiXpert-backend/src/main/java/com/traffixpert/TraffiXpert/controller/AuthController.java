package com.traffixpert.TraffiXpert.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:9002") // Allow frontend access
public class AuthController {

    // Inner class to represent the login request body
    // Using a record for simplicity (requires Java 16+)
    public record LoginRequest(String username, String password) {}

    /**
     * Endpoint to handle user login.
     * Accessed via POST request to /api/auth/login
     * @param loginRequest DTO containing username and password.
     * @return ResponseEntity indicating success or failure.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        // --- Basic Hardcoded Authentication ---
        // TODO: Replace this with real authentication (e.g., Spring Security + database)
        String hardcodedUsername = "user";
        String hardcodedPassword = "password"; // Choose a simple password for testing

        if (hardcodedUsername.equals(loginRequest.username()) && hardcodedPassword.equals(loginRequest.password())) {
            // Login successful
            System.out.println("Login successful for user: " + loginRequest.username());
            // In a real app, you'd generate a token (JWT) or session here.
            // For now, just return OK.
            // You could return a simple success message or user info if needed.
            return ResponseEntity.ok(Map.of("message", "Login successful"));
        } else {
            // Login failed
            System.out.println("Login failed for user: " + loginRequest.username());
            // Return 401 Unauthorized with an error message
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                 .body(Map.of("message", "Invalid username or password"));
        }
        // --- End Basic Authentication ---
    }
}
