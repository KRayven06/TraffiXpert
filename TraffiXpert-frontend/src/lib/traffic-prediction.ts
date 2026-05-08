/**
 * Traffic flow prediction utilities using exponential smoothing
 * and weighted moving average models for short-term forecasting.
 *
 * These methods are designed for client-side prediction to reduce
 * API calls during high-frequency simulation updates.
 */

export interface TrafficDataPoint {
  timestamp: number;
  vehicleCount: number;
  avgSpeed: number;
  occupancy: number;
}

export interface PredictionResult {
  predictedCount: number;
  predictedSpeed: number;
  confidence: number;
  horizon: number;
}

/**
 * Simple Exponential Smoothing (SES) for single-step forecasting.
 * Suitable for traffic data without strong trend or seasonality
 * within short observation windows.
 */
export function exponentialSmoothing(
  data: number[],
  alpha: number = 0.3
): number {
  if (!data || data.length === 0) return 0;
  if (data.length === 1) return data[0];

  let smoothed = data[0];
  for (let i = 1; i < data.length; i++) {
    smoothed = alpha * data[i] + (1 - alpha) * smoothed;
  }
  return Math.round(smoothed * 100) / 100;
}

/**
 * Double Exponential Smoothing (Holt's method) for trend-aware forecasting.
 * Captures both level and trend components in traffic volume data.
 */
export function holtSmoothing(
  data: number[],
  alpha: number = 0.3,
  beta: number = 0.1,
  stepsAhead: number = 1
): number {
  if (!data || data.length < 2) return data?.[0] ?? 0;

  let level = data[0];
  let trend = data[1] - data[0];

  for (let i = 1; i < data.length; i++) {
    const prevLevel = level;
    level = alpha * data[i] + (1 - alpha) * (prevLevel + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
  }

  return Math.round((level + stepsAhead * trend) * 100) / 100;
}

/**
 * Weighted Moving Average with exponentially decaying weights.
 * More recent observations have higher influence on the forecast.
 */
export function weightedMovingAverage(
  data: number[],
  windowSize: number = 5
): number {
  if (!data || data.length === 0) return 0;

  const window = data.slice(-windowSize);
  let weightSum = 0;
  let valueSum = 0;

  for (let i = 0; i < window.length; i++) {
    const weight = i + 1; // Linear weights: 1, 2, 3, ...
    valueSum += window[i] * weight;
    weightSum += weight;
  }

  return weightSum > 0 ? Math.round((valueSum / weightSum) * 100) / 100 : 0;
}

/**
 * Calculates prediction confidence based on data variance and sample size.
 * Returns a value between 0.0 (no confidence) and 1.0 (high confidence).
 */
export function calculateConfidence(
  data: number[],
  minSamples: number = 10
): number {
  if (!data || data.length < 2) return 0;

  const mean = data.reduce((sum, v) => sum + v, 0) / data.length;
  const variance =
    data.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / data.length;
  const cv = mean !== 0 ? Math.sqrt(variance) / Math.abs(mean) : 1;

  // Sample size factor (logarithmic scaling)
  const sizeFactor = Math.min(Math.log2(data.length + 1) / Math.log2(minSamples + 1), 1.0);

  // Variability factor (lower CV = higher confidence)
  const variabilityFactor = Math.max(1.0 - cv, 0.0);

  return Math.round(sizeFactor * variabilityFactor * 100) / 100;
}

/**
 * Detects anomalies in traffic data using a modified Z-score approach.
 * Useful for identifying sensor errors or unusual traffic events.
 */
export function detectAnomalies(
  data: number[],
  threshold: number = 3.0
): number[] {
  if (!data || data.length < 5) return [];

  const sorted = [...data].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const mad =
    [...data]
      .map((v) => Math.abs(v - median))
      .sort((a, b) => a - b)[Math.floor(data.length / 2)] || 1;

  const anomalyIndices: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const modifiedZScore = (0.6745 * (data[i] - median)) / mad;
    if (Math.abs(modifiedZScore) > threshold) {
      anomalyIndices.push(i);
    }
  }

  return anomalyIndices;
}

/**
 * Generates a multi-step traffic volume forecast using Holt's method.
 */
export function generateForecast(
  historicalData: TrafficDataPoint[],
  horizonMinutes: number = 15,
  intervalMinutes: number = 5
): PredictionResult[] {
  if (!historicalData || historicalData.length < 3) return [];

  const counts = historicalData.map((d) => d.vehicleCount);
  const speeds = historicalData.map((d) => d.avgSpeed);
  const confidence = calculateConfidence(counts);
  const steps = Math.ceil(horizonMinutes / intervalMinutes);
  const results: PredictionResult[] = [];

  for (let step = 1; step <= steps; step++) {
    const decayFactor = Math.pow(0.9, step - 1);
    results.push({
      predictedCount: Math.max(0, Math.round(holtSmoothing(counts, 0.3, 0.1, step))),
      predictedSpeed: Math.max(0, holtSmoothing(speeds, 0.4, 0.05, step)),
      confidence: Math.round(confidence * decayFactor * 100) / 100,
      horizon: step * intervalMinutes,
    });
  }

  return results;
}
