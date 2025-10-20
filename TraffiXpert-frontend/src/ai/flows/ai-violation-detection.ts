'use server';
/**
 * @fileOverview AI-powered traffic violation detection flow.
 *
 * - detectTrafficViolation - A function that detects traffic violations using AI.
 * - DetectTrafficViolationInput - The input type for the detectTrafficViolation function.
 * - DetectTrafficViolationOutput - The return type for the detectTrafficViolation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectTrafficViolationInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a traffic intersection, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().describe('A description of the scene in the image.'),
});
export type DetectTrafficViolationInput = z.infer<typeof DetectTrafficViolationInputSchema>;

const DetectTrafficViolationOutputSchema = z.object({
  violations: z
    .array(
      z.object({
        type: z.string().describe('The type of traffic violation detected.'),
        confidence: z.number().describe('The confidence level of the detection (0-1).'),
        details: z.string().optional().describe('Additional details about the violation.'),
      })
    )
    .describe('A list of traffic violations detected in the image.'),
});
export type DetectTrafficViolationOutput = z.infer<typeof DetectTrafficViolationOutputSchema>;

export async function detectTrafficViolation(input: DetectTrafficViolationInput): Promise<DetectTrafficViolationOutput> {
  return detectTrafficViolationFlow(input);
}

const detectTrafficViolationPrompt = ai.definePrompt({
  name: 'detectTrafficViolationPrompt',
  input: {schema: DetectTrafficViolationInputSchema},
  output: {schema: DetectTrafficViolationOutputSchema},
  prompt: `You are an AI-powered traffic violation detection system.

You will receive an image and a description of a traffic intersection scene. Your task is to identify any traffic violations occurring in the image, such as red light running, speeding, or wrong lane usage.

Description: {{{description}}}
Image: {{media url=imageDataUri}}

Analyze the image and identify any traffic violations. Provide a list of violations, including the type of violation, your confidence level in the detection, and any relevant details.

Output the result in JSON format.
`,
});

const detectTrafficViolationFlow = ai.defineFlow(
  {
    name: 'detectTrafficViolationFlow',
    inputSchema: DetectTrafficViolationInputSchema,
    outputSchema: DetectTrafficViolationOutputSchema,
  },
  async input => {
    const {output} = await detectTrafficViolationPrompt(input);
    return output!;
  }
);
