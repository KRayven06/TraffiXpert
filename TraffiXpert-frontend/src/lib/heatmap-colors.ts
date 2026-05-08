/**
 * Color interpolation and mapping utilities for traffic density heatmaps.
 * Provides functions to convert traffic metrics into visual color scales
 * used across dashboard charts and map overlays.
 */

export type ColorStop = {
  position: number; // 0.0 to 1.0
  color: [number, number, number]; // RGB tuple
};

// Default traffic density color scale (green → yellow → orange → red)
const DENSITY_COLOR_SCALE: ColorStop[] = [
  { position: 0.0, color: [34, 197, 94] },    // Green - free flow
  { position: 0.3, color: [132, 204, 22] },    // Lime - stable flow
  { position: 0.5, color: [250, 204, 21] },    // Yellow - approaching capacity
  { position: 0.7, color: [249, 115, 22] },    // Orange - near capacity
  { position: 0.85, color: [239, 68, 68] },    // Red - at capacity
  { position: 1.0, color: [153, 27, 27] },     // Dark red - oversaturated
];

// Level of Service color mapping
const LOS_COLORS: Record<string, string> = {
  A: "#22c55e",
  B: "#84cc16",
  C: "#facc15",
  D: "#f97316",
  E: "#ef4444",
  F: "#991b1b",
};

/**
 * Interpolates between two RGB colors.
 */
function lerpColor(
  c1: [number, number, number],
  c2: [number, number, number],
  t: number
): [number, number, number] {
  const clamped = Math.max(0, Math.min(1, t));
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * clamped),
    Math.round(c1[1] + (c2[1] - c1[1]) * clamped),
    Math.round(c1[2] + (c2[2] - c1[2]) * clamped),
  ];
}

/**
 * Maps a normalized value (0.0 - 1.0) to an RGB color using the
 * traffic density color scale with smooth interpolation.
 *
 * @param value Normalized metric value between 0.0 and 1.0
 * @param scale Optional custom color scale (defaults to density scale)
 * @returns CSS rgb() color string
 */
export function getTrafficColor(
  value: number,
  scale: ColorStop[] = DENSITY_COLOR_SCALE
): string {
  const clamped = Math.max(0, Math.min(1, value));

  // Find surrounding color stops
  let lower = scale[0];
  let upper = scale[scale.length - 1];

  for (let i = 0; i < scale.length - 1; i++) {
    if (clamped >= scale[i].position && clamped <= scale[i + 1].position) {
      lower = scale[i];
      upper = scale[i + 1];
      break;
    }
  }

  const range = upper.position - lower.position;
  const t = range > 0 ? (clamped - lower.position) / range : 0;
  const [r, g, b] = lerpColor(lower.color, upper.color, t);

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Returns the hex color associated with a Level of Service grade.
 *
 * @param los Level of Service character ('A' through 'F')
 * @returns Hex color string
 */
export function getLosColor(los: string): string {
  return LOS_COLORS[los.toUpperCase()] || LOS_COLORS.F;
}

/**
 * Generates a CSS gradient string for a congestion bar visualization.
 *
 * @param segments Array of congestion values (0.0 - 1.0) for each segment
 * @param direction CSS gradient direction (default: "to right")
 * @returns CSS linear-gradient string
 */
export function generateCongestionGradient(
  segments: number[],
  direction: string = "to right"
): string {
  if (!segments || segments.length === 0) {
    return `linear-gradient(${direction}, ${getTrafficColor(0)}, ${getTrafficColor(0)})`;
  }

  const stops = segments.map((value, index) => {
    const position = (index / Math.max(segments.length - 1, 1)) * 100;
    return `${getTrafficColor(value)} ${position.toFixed(1)}%`;
  });

  return `linear-gradient(${direction}, ${stops.join(", ")})`;
}

/**
 * Converts a congestion index to a human-readable status label.
 */
export function getCongestionLabel(index: number): string {
  if (index < 0.2) return "Free Flow";
  if (index < 0.4) return "Light";
  if (index < 0.6) return "Moderate";
  if (index < 0.8) return "Heavy";
  return "Severe";
}

/**
 * Returns an appropriate status color class name for use with UI badge components.
 */
export function getCongestionBadgeVariant(
  index: number
): "default" | "secondary" | "destructive" | "outline" {
  if (index < 0.3) return "default";
  if (index < 0.6) return "secondary";
  if (index < 0.8) return "outline";
  return "destructive";
}
