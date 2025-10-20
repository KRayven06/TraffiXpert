'use server';

/**
 * @fileOverview A traffic condition prediction AI agent.
 *
 * - predictTrafficConditions - A function that predicts future traffic conditions and suggests optimized signal timings.
 * - PredictTrafficConditionsInput - The input type for the predictTrafficConditions function.
 * - PredictTrafficConditionsOutput - The return type for the predictTrafficConditions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictTrafficConditionsInputSchema = z.object({
  currentTrafficData: z
    .string()
    .describe(
      'A JSON string containing current traffic data, including vehicle counts by direction (North, South, East, West), average wait times, and any recent incidents.'
    ),
  historicalTrafficData: z
    .string()
    .describe(
      'A JSON string containing historical traffic data, including traffic volume by time of day and day of week.'
    ),
  weatherConditions: z.string().describe('Current weather conditions.'),
});
export type PredictTrafficConditionsInput = z.infer<typeof PredictTrafficConditionsInputSchema>;

const PredictTrafficConditionsOutputSchema = z.object({
  predictedTrafficConditions: z
    .string()
    .describe('A description of predicted traffic conditions for the next hour.'),
  suggestedSignalTimings: z
    .string()
    .describe(
      'Suggested traffic signal timings (in seconds) for each direction (North, South, East, West) to optimize traffic flow.'
    ),
  congestionLevel: z
    .string()
    .describe('The predicted congestion level (e.g., Low, Moderate, High).'),
});
export type PredictTrafficConditionsOutput = z.infer<typeof PredictTrafficConditionsOutputSchema>;

export async function predictTrafficConditions(
  input: PredictTrafficConditionsInput
): Promise<PredictTrafficConditionsOutput> {
  return predictTrafficConditionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictTrafficConditionsPrompt',
  input: {schema: PredictTrafficConditionsInputSchema},
  output: {schema: PredictTrafficConditionsOutputSchema},
  prompt: `You are an expert traffic management system. Analyze the current traffic data, historical traffic data, and weather conditions to predict future traffic conditions and suggest optimized signal timings.

Current Traffic Data: {{{currentTrafficData}}}
Historical Traffic Data: {{{historicalTrafficData}}}
Weather Conditions: {{{weatherConditions}}}

Provide a prediction of traffic conditions for the next hour, suggested signal timings for each direction (North, South, East, West), and the predicted congestion level (Low, Moderate, High).`,
});

const predictTrafficConditionsFlow = ai.defineFlow(
  {
    name: 'predictTrafficConditionsFlow',
    inputSchema: PredictTrafficConditionsInputSchema,
    outputSchema: PredictTrafficConditionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
