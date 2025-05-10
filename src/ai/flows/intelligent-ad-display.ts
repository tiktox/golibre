// src/ai/flows/intelligent-ad-display.ts
'use server';

/**
 * @fileOverview A flow that determines when and what advertisement should be displayed to the driver.
 *
 * - intelligentAdDisplay - A function that determines the advertisement to be displayed.
 * - IntelligentAdDisplayInput - The input type for the intelligentAdDisplay function.
 * - IntelligentAdDisplayOutput - The return type for the intelligentAdDisplay function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentAdDisplayInputSchema = z.object({
  driverStatus: z.enum(['WAITING', 'COMPLETING']).describe('The current status of the driver.'),
  timeOfDay: z
    .string()
    .describe('The current time of day in ISO 8601 format (e.g., 2024-04-03T10:00:00Z).'),
  tripHistory: z
    .string()
    .describe(
      'A summary of the driver trip history, including the types of trips, locations, and times.'
    ),
});
export type IntelligentAdDisplayInput = z.infer<typeof IntelligentAdDisplayInputSchema>;

const IntelligentAdDisplayOutputSchema = z.object({
  displayAd: z.boolean().describe('Whether an ad should be displayed.'),
  adContent: z.string().describe('The content of the ad to display.'),
  reason: z.string().describe('The reason for displaying this ad.'),
});
export type IntelligentAdDisplayOutput = z.infer<typeof IntelligentAdDisplayOutputSchema>;

export async function intelligentAdDisplay(input: IntelligentAdDisplayInput): Promise<IntelligentAdDisplayOutput> {
  return intelligentAdDisplayFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentAdDisplayPrompt',
  input: {schema: IntelligentAdDisplayInputSchema},
  output: {schema: IntelligentAdDisplayOutputSchema},
  prompt: `You are an expert in determining when and what advertisements should be displayed to drivers in a ride-sharing app, without being intrusive. The goal is to make the ads potentially useful to the drivers.

  Here's information about the driver:
  Status: {{{driverStatus}}}
  Time of Day: {{{timeOfDay}}}
  Trip History: {{{tripHistory}}}

  Based on this information, determine whether to display an ad and, if so, what ad to display.
  Consider the driver's status, the time of day, and their trip history to make the ad relevant and not intrusive.
  For example, if the driver is waiting for a ride and it's lunchtime, suggest ads for nearby restaurants. If they are completing a ride, suggest ads for car maintenance services.

  Return the result in JSON format.
  `, config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const intelligentAdDisplayFlow = ai.defineFlow(
  {
    name: 'intelligentAdDisplayFlow',
    inputSchema: IntelligentAdDisplayInputSchema,
    outputSchema: IntelligentAdDisplayOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
