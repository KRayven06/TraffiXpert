package com.traffixpert.TraffiXpert.model;

import java.util.List;
import java.util.ArrayList;
import java.util.Collections;

/**
 * Represents a single phase in a traffic signal cycle at an intersection.
 * Each phase defines which movement groups have right-of-way during a
 * specific interval of the signal cycle.
 */
public class IntersectionPhase {

    private int phaseNumber;
    private double minGreen;
    private double maxGreen;
    private double yellowInterval;
    private double allRedInterval;
    private List<String> movementGroups;
    private boolean pedestrianPhase;
    private double pedestrianWalkTime;
    private double pedestrianClearanceTime;

    public IntersectionPhase(int phaseNumber, double minGreen, double maxGreen) {
        this.phaseNumber = phaseNumber;
        this.minGreen = Math.max(minGreen, 4.0);
        this.maxGreen = Math.max(maxGreen, this.minGreen);
        this.yellowInterval = 3.0;
        this.allRedInterval = 2.0;
        this.movementGroups = new ArrayList<>();
        this.pedestrianPhase = false;
        this.pedestrianWalkTime = 7.0;
        this.pedestrianClearanceTime = 0.0;
    }

    public void addMovementGroup(String movement) {
        if (movement != null && !movement.isBlank() && !movementGroups.contains(movement)) {
            movementGroups.add(movement);
        }
    }

    public boolean conflictsWith(IntersectionPhase other) {
        if (other == null) return false;
        for (String movement : this.movementGroups) {
            String opposing = getOpposingMovement(movement);
            if (opposing != null && other.movementGroups.contains(opposing)) {
                if (isLeftTurn(movement) || isLeftTurn(opposing)) {
                    return true;
                }
            }
        }
        return false;
    }

    public double getTotalPhaseDuration(double effectiveGreen) {
        double green = Math.max(Math.min(effectiveGreen, maxGreen), minGreen);
        double total = green + yellowInterval + allRedInterval;
        if (pedestrianPhase) {
            double pedTotal = pedestrianWalkTime + pedestrianClearanceTime;
            total = Math.max(total, pedTotal + yellowInterval + allRedInterval);
        }
        return total;
    }

    public void enablePedestrianPhase(double crosswalkLength, double walkSpeed) {
        this.pedestrianPhase = true;
        this.pedestrianWalkTime = 7.0;
        double speed = walkSpeed > 0 ? walkSpeed : 1.2;
        this.pedestrianClearanceTime = crosswalkLength / speed;
    }

    private static String getOpposingMovement(String movement) {
        if (movement == null) return null;
        if (movement.startsWith("NB_")) return movement.replace("NB_", "SB_");
        if (movement.startsWith("SB_")) return movement.replace("SB_", "NB_");
        if (movement.startsWith("EB_")) return movement.replace("EB_", "WB_");
        if (movement.startsWith("WB_")) return movement.replace("WB_", "EB_");
        return null;
    }

    private static boolean isLeftTurn(String movement) {
        return movement != null && movement.endsWith("_LEFT");
    }

    public int getPhaseNumber() { return phaseNumber; }
    public double getMinGreen() { return minGreen; }
    public double getMaxGreen() { return maxGreen; }
    public double getYellowInterval() { return yellowInterval; }
    public double getAllRedInterval() { return allRedInterval; }
    public List<String> getMovementGroups() { return Collections.unmodifiableList(movementGroups); }
    public boolean isPedestrianPhase() { return pedestrianPhase; }

    public void setPhaseNumber(int phaseNumber) { this.phaseNumber = phaseNumber; }
    public void setMinGreen(double minGreen) { this.minGreen = Math.max(minGreen, 4.0); }
    public void setMaxGreen(double maxGreen) { this.maxGreen = Math.max(maxGreen, this.minGreen); }
    public void setYellowInterval(double yellowInterval) { this.yellowInterval = yellowInterval; }
    public void setAllRedInterval(double allRedInterval) { this.allRedInterval = allRedInterval; }
}
