package com.traffixpert.TraffiXpert.util;

import java.util.Arrays;
import java.util.List;

/**
 * Utility class for computing optimal signal phase timings using
 * Webster's formula and critical lane volume analysis.
 *
 * Reference: Webster, F.V. (1958) "Traffic Signal Settings"
 * Road Research Technical Paper No. 39, HMSO, London.
 */
public final class SignalTimingOptimizer {

    // Webster's formula constants
    private static final double LOST_TIME_PER_PHASE = 3.5; // seconds
    private static final double STARTUP_LOST_TIME = 2.0;   // seconds
    private static final double YELLOW_INTERVAL = 3.0;     // seconds
    private static final double ALL_RED_INTERVAL = 2.0;    // seconds

    // Saturation flow rates (vehicles per hour of green per lane)
    private static final double DEFAULT_SATURATION_FLOW = 1800.0;
    private static final double PROTECTED_LEFT_SATURATION = 1600.0;
    private static final double RIGHT_TURN_SATURATION = 1500.0;

    // Constraints
    private static final double MIN_GREEN_TIME = 7.0;      // seconds
    private static final double MAX_GREEN_TIME = 120.0;     // seconds
    private static final double MIN_CYCLE_LENGTH = 30.0;    // seconds
    private static final double MAX_CYCLE_LENGTH = 180.0;   // seconds

    private SignalTimingOptimizer() {
        // Prevent instantiation
    }

    /**
     * Calculates the optimal cycle length using Webster's formula.
     *
     * C_opt = (1.5 * L + 5) / (1 - Y)
     *
     * where L = total lost time, Y = sum of critical volume-to-capacity ratios
     *
     * @param criticalFlowRatios List of critical v/s ratios for each phase
     * @param numberOfPhases     Number of signal phases
     * @return Optimal cycle length in seconds, clamped to valid range
     */
    public static double calculateOptimalCycleLength(List<Double> criticalFlowRatios,
                                                      int numberOfPhases) {
        if (criticalFlowRatios == null || criticalFlowRatios.isEmpty() || numberOfPhases <= 0) {
            return MIN_CYCLE_LENGTH;
        }

        double totalLostTime = numberOfPhases * LOST_TIME_PER_PHASE;
        double sumY = criticalFlowRatios.stream().mapToDouble(Double::doubleValue).sum();

        // If sum of critical ratios >= 1.0, intersection is oversaturated
        if (sumY >= 0.95) {
            return MAX_CYCLE_LENGTH;
        }

        double optimalCycle = (1.5 * totalLostTime + 5.0) / (1.0 - sumY);
        return clamp(optimalCycle, MIN_CYCLE_LENGTH, MAX_CYCLE_LENGTH);
    }

    /**
     * Distributes green time across phases proportionally to their
     * critical lane volumes.
     *
     * @param cycleLength        Total cycle length in seconds
     * @param criticalFlowRatios Critical v/s ratios per phase
     * @param numberOfPhases     Number of phases
     * @return Array of effective green times per phase (seconds)
     */
    public static double[] distributeGreenTime(double cycleLength,
                                                List<Double> criticalFlowRatios,
                                                int numberOfPhases) {
        double[] greenTimes = new double[numberOfPhases];

        if (criticalFlowRatios == null || criticalFlowRatios.size() != numberOfPhases) {
            // Equal distribution fallback
            double totalLostTime = numberOfPhases * (YELLOW_INTERVAL + ALL_RED_INTERVAL);
            double availableGreen = Math.max(cycleLength - totalLostTime, numberOfPhases * MIN_GREEN_TIME);
            double perPhase = availableGreen / numberOfPhases;
            Arrays.fill(greenTimes, clamp(perPhase, MIN_GREEN_TIME, MAX_GREEN_TIME));
            return greenTimes;
        }

        double sumY = criticalFlowRatios.stream().mapToDouble(Double::doubleValue).sum();
        double totalChangeInterval = numberOfPhases * (YELLOW_INTERVAL + ALL_RED_INTERVAL);
        double totalEffectiveGreen = cycleLength - totalChangeInterval;

        if (totalEffectiveGreen <= 0 || sumY <= 0) {
            Arrays.fill(greenTimes, MIN_GREEN_TIME);
            return greenTimes;
        }

        for (int i = 0; i < numberOfPhases; i++) {
            double proportion = criticalFlowRatios.get(i) / sumY;
            greenTimes[i] = clamp(proportion * totalEffectiveGreen, MIN_GREEN_TIME, MAX_GREEN_TIME);
        }

        return greenTimes;
    }

    /**
     * Calculates the critical lane volume-to-saturation ratio
     * for a given approach.
     *
     * @param demandVolume     Demand volume in vehicles per hour
     * @param numberOfLanes   Number of available lanes
     * @param saturationFlow   Saturation flow rate per lane (veh/hr/lane)
     * @param adjustmentFactor Heavy vehicle and pedestrian adjustment (0.0-1.0)
     * @return Volume-to-saturation ratio (v/s)
     */
    public static double calculateFlowRatio(int demandVolume, int numberOfLanes,
                                             double saturationFlow, double adjustmentFactor) {
        if (numberOfLanes <= 0 || saturationFlow <= 0) return 0.0;
        double adjustedSaturation = saturationFlow * clamp(adjustmentFactor, 0.1, 1.0);
        double perLaneVolume = (double) demandVolume / numberOfLanes;
        return perLaneVolume / adjustedSaturation;
    }

    /**
     * Estimates the average vehicle delay for an approach using
     * the Webster delay model.
     *
     * d = (c(1-g/c)^2) / (2(1 - min(1, x) * g/c)) + (x^2) / (2q(1 - x))
     *
     * @param cycleLength   Total cycle length (seconds)
     * @param effectiveGreen Effective green time (seconds)
     * @param demandVolume  Demand volume (vehicles per second)
     * @param capacity      Capacity of the approach (vehicles per second)
     * @return Estimated average delay in seconds per vehicle
     */
    public static double estimateWebsterDelay(double cycleLength, double effectiveGreen,
                                               double demandVolume, double capacity) {
        if (cycleLength <= 0 || capacity <= 0) return 0.0;

        double greenRatio = effectiveGreen / cycleLength;
        double x = Math.min(demandVolume / capacity, 1.5); // degree of saturation, capped

        // Uniform delay component
        double uniformDelay = (cycleLength * Math.pow(1.0 - greenRatio, 2)) /
                              (2.0 * (1.0 - Math.min(1.0, x) * greenRatio));

        // Overflow delay component
        double overflowDelay = 0.0;
        if (x < 1.0 && demandVolume > 0) {
            overflowDelay = (Math.pow(x, 2)) / (2.0 * demandVolume * (1.0 - x));
        } else if (x >= 1.0) {
            // Simplified overflow for oversaturated conditions
            overflowDelay = 15.0 * (x - 1.0) * cycleLength;
        }

        return Math.max(uniformDelay + overflowDelay, 0.0);
    }

    /**
     * Determines the minimum pedestrian crossing time based on crosswalk length.
     *
     * @param crosswalkLength Length of the crosswalk in meters
     * @param walkSpeed       Pedestrian walking speed in m/s (default 1.2 m/s)
     * @return Minimum pedestrian phase time in seconds
     */
    public static double calculatePedestrianPhaseTime(double crosswalkLength, double walkSpeed) {
        double speed = walkSpeed > 0 ? walkSpeed : 1.2;
        double walkTime = 7.0; // Initial walk indication (WALK)
        double flashingTime = crosswalkLength / speed; // Flashing Don't Walk
        return walkTime + flashingTime;
    }

    private static double clamp(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }
}
