package com.traffixpert.TraffiXpert.util;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

/**
 * Utility class for computing traffic density metrics and congestion indices.
 * Provides static methods for real-time traffic flow analysis.
 *
 * Based on the Highway Capacity Manual (HCM) Level of Service framework
 * adapted for intersection-level simulation.
 */
public final class TrafficMetricsCalculator {

    // LOS thresholds (vehicles per lane per hour)
    private static final double LOS_A_THRESHOLD = 11.0;
    private static final double LOS_B_THRESHOLD = 18.0;
    private static final double LOS_C_THRESHOLD = 25.0;
    private static final double LOS_D_THRESHOLD = 35.0;
    private static final double LOS_E_THRESHOLD = 45.0;

    // Congestion index weights
    private static final double DENSITY_WEIGHT = 0.45;
    private static final double DELAY_WEIGHT = 0.35;
    private static final double QUEUE_WEIGHT = 0.20;

    private TrafficMetricsCalculator() {
        // Prevent instantiation
    }

    /**
     * Calculates the Level of Service (LOS) grade based on average control delay.
     * Follows HCM methodology for signalized intersections.
     *
     * @param avgControlDelay Average control delay in seconds per vehicle
     * @return LOS grade character ('A' through 'F')
     */
    public static char calculateLevelOfService(double avgControlDelay) {
        if (avgControlDelay <= LOS_A_THRESHOLD) return 'A';
        if (avgControlDelay <= LOS_B_THRESHOLD) return 'B';
        if (avgControlDelay <= LOS_C_THRESHOLD) return 'C';
        if (avgControlDelay <= LOS_D_THRESHOLD) return 'D';
        if (avgControlDelay <= LOS_E_THRESHOLD) return 'E';
        return 'F';
    }

    /**
     * Computes a normalized congestion index (0.0 - 1.0) for a road segment.
     * Combines density ratio, average delay, and queue length into a single metric.
     *
     * @param currentDensity    Current vehicle density (vehicles per km)
     * @param jamDensity        Maximum jam density for the segment
     * @param avgDelay          Average delay experienced by vehicles (seconds)
     * @param maxExpectedDelay  Maximum expected delay at saturation
     * @param queueLength       Current queue length (number of vehicles)
     * @param maxQueueCapacity  Maximum queue capacity before spillback
     * @return Normalized congestion index between 0.0 and 1.0
     */
    public static double computeCongestionIndex(double currentDensity, double jamDensity,
                                                 double avgDelay, double maxExpectedDelay,
                                                 int queueLength, int maxQueueCapacity) {
        double densityRatio = clamp(currentDensity / Math.max(jamDensity, 1.0), 0.0, 1.0);
        double delayRatio = clamp(avgDelay / Math.max(maxExpectedDelay, 1.0), 0.0, 1.0);
        double queueRatio = clamp((double) queueLength / Math.max(maxQueueCapacity, 1), 0.0, 1.0);

        return DENSITY_WEIGHT * densityRatio + DELAY_WEIGHT * delayRatio + QUEUE_WEIGHT * queueRatio;
    }

    /**
     * Estimates average vehicle throughput for a given green phase duration
     * and saturation flow rate.
     *
     * @param greenDuration     Green phase duration in seconds
     * @param cycleDuration     Total cycle duration in seconds
     * @param saturationFlowRate Saturation flow rate (vehicles per hour of green)
     * @param adjustmentFactor  Volume-to-capacity adjustment factor (0.0 - 1.0)
     * @return Estimated throughput in vehicles per hour
     */
    public static double estimateThroughput(double greenDuration, double cycleDuration,
                                             double saturationFlowRate, double adjustmentFactor) {
        if (cycleDuration <= 0 || greenDuration <= 0) return 0.0;
        double effectiveGreenRatio = Math.min(greenDuration / cycleDuration, 1.0);
        return saturationFlowRate * effectiveGreenRatio * clamp(adjustmentFactor, 0.0, 1.0);
    }

    /**
     * Aggregates per-lane metrics into a segment-level summary.
     *
     * @param laneDelays List of average delays per lane (seconds)
     * @return Map containing aggregated statistics: mean, max, std deviation
     */
    public static Map<String, Double> aggregateLaneMetrics(List<Double> laneDelays) {
        Map<String, Double> result = new HashMap<>();
        if (laneDelays == null || laneDelays.isEmpty()) {
            result.put("mean", 0.0);
            result.put("max", 0.0);
            result.put("stdDev", 0.0);
            return result;
        }

        double sum = laneDelays.stream().mapToDouble(Double::doubleValue).sum();
        double mean = sum / laneDelays.size();
        double max = laneDelays.stream().mapToDouble(Double::doubleValue).max().orElse(0.0);

        double variance = laneDelays.stream()
                .mapToDouble(d -> Math.pow(d - mean, 2))
                .sum() / laneDelays.size();
        double stdDev = Math.sqrt(variance);

        result.put("mean", Math.round(mean * 100.0) / 100.0);
        result.put("max", Math.round(max * 100.0) / 100.0);
        result.put("stdDev", Math.round(stdDev * 100.0) / 100.0);
        return result;
    }

    /**
     * Calculates the Peak Hour Factor (PHF) from 15-minute volume counts.
     *
     * @param quarterHourVolumes List of exactly four 15-minute volume counts
     * @return Peak Hour Factor, or -1.0 if input is invalid
     */
    public static double calculatePeakHourFactor(List<Integer> quarterHourVolumes) {
        if (quarterHourVolumes == null || quarterHourVolumes.size() != 4) {
            return -1.0;
        }
        int totalVolume = quarterHourVolumes.stream().mapToInt(Integer::intValue).sum();
        int peakQuarter = quarterHourVolumes.stream().mapToInt(Integer::intValue).max().orElse(1);
        if (peakQuarter == 0) return 0.0;
        return (double) totalVolume / (4.0 * peakQuarter);
    }

    /**
     * Clamps a value between min and max bounds.
     */
    private static double clamp(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }
}
