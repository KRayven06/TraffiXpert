'use server';
/**
 * @fileOverview AI-powered daily traffic report generation flow.
 *
 * - generateDailyReport - A function that generates a summary of the day's traffic data.
 * - GenerateDailyReportInput - The input type for the generateDailyReport function.
 * - GenerateDailyReportOutput - The return type for the generateDailyReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDailyReportInputSchema = z.object({
  totalVehicles: z.number().describe("Total vehicles that passed through the intersection today."),
  avgWaitTime: z.number().describe("Average vehicle wait time in seconds."),
  violations: z.array(z.object({
      type: z.string(),
      count: z.number(),
  })).describe("A summary of violations by type and count."),
});
export type GenerateDailyReportInput = z.infer<typeof GenerateDailyReportInputSchema>;

const GenerateDailyReportOutputSchema = z.object({
  summary: z.string().describe("A concise, human-readable summary of the day's traffic performance."),
  recommendations: z.array(z.string()).describe("A list of actionable recommendations to improve traffic flow."),
});
export type GenerateDailyReportOutput = z.infer<typeof GenerateDailyReportOutputSchema>;


export async function generateDailyReport(input: GenerateDailyReportInput): Promise<GenerateDailyReportOutput> {
  const prompt = ai.definePrompt({
    name: 'generateDailyReportPrompt',
    input: {schema: GenerateDailyReportInputSchema},
    output: {schema: GenerateDailyReportOutputSchema},
    prompt: `You are a traffic analysis expert. Based on the following daily statistics, generate a concise summary and provide actionable recommendations.

Today's data:
- Total Vehicles: {{{totalVehicles}}}
- Average Wait Time: {{{avgWaitTime}}}s
- Violations: {{#each violations}}{{this.count}} {{this.type}} violations{{/each}}

Generate a brief summary of the day's performance and provide 2-3 specific, actionable recommendations for improvement. For example, if wait times are high, suggest adjusting signal timing during peak hours.
`,
  });

  const generateDailyReportFlow = ai.defineFlow(
    {
      name: 'generateDailyReportFlow',
      inputSchema: GenerateDailyReportInputSchema,
      outputSchema: GenerateDailyReportOutputSchema,
    },
    async input => {
      const {output} = await prompt(input);
      return output!;
    }
  );
  
  return generateDailyReportFlow(input);
}
