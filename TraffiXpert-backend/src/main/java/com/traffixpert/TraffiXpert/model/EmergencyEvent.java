package com.traffixpert.TraffiXpert.model; // Adjust package name if needed

import java.time.LocalTime;

// Might become @Entity later
public class EmergencyEvent {
    private String id;
    private LocalTime time; // Changed from String
    private String type; // e.g., "Ambulance"
    private double clearanceTime; // Changed from number to double

    // Constructor
    public EmergencyEvent(String id, LocalTime time, String type, double clearanceTime) {
        this.id = id;
        this.time = time;
        this.type = type;
        this.clearanceTime = clearanceTime;
    }

    // --- Getters ---
    public String getId() {
        return id;
    }

    public LocalTime getTime() {
        return time;
    }

    public String getType() {
        return type;
    }

    public double getClearanceTime() {
        return clearanceTime;
    }

     // --- Setters (Optional) ---
     public void setId(String id) {
        this.id = id;
    }
     public void setTime(LocalTime time) {
        this.time = time;
    }
     public void setType(String type) {
        this.type = type;
    }
     public void setClearanceTime(double clearanceTime) {
        this.clearanceTime = clearanceTime;
    }
}