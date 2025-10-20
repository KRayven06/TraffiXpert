package com.traffixpert.TraffiXpert.model; // Adjust package name if needed

import java.time.LocalTime; // Using Java's time library

// We might add JPA annotations (@Entity, @Id, etc.) later if we store this in DB
public class Violation {
    private String id;
    private LocalTime time; // Changed from String to LocalTime
    private String location;
    private String type;
    private String fine;

    // Constructor
    public Violation(String id, LocalTime time, String location, String type, String fine) {
        this.id = id;
        this.time = time;
        this.location = location;
        this.type = type;
        this.fine = fine;
    }

    // --- Getters ---
    public String getId() {
        return id;
    }

    public LocalTime getTime() {
        return time;
    }

    public String getLocation() {
        return location;
    }

    public String getType() {
        return type;
    }

    public String getFine() {
        return fine;
    }

    // --- Setters (Optional, depends on if you need to modify after creation) ---
     public void setId(String id) {
        this.id = id;
    }
     public void setTime(LocalTime time) {
        this.time = time;
    }
     public void setLocation(String location) {
        this.location = location;
    }
     public void setType(String type) {
        this.type = type;
    }
     public void setFine(String fine) {
        this.fine = fine;
    }
}
