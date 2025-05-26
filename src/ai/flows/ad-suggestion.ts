// src/ai/flows/ad-suggestion.ts
'use server';

/**
 * @fileOverview Ad suggestion flow for drivers based on location, time, and trip history.
 *
 * - suggestDriverAds - A function that suggests relevant ads for drivers.
 * - SuggestDriverAdsInput - The input type for the suggestDriverAds function.
 * - SuggestDriverAdsOutput - The return type for the suggestDriverAds function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDriverAdsInputSchema = z.object({
  location: z
    .string()
    .describe('The current GPS coordinates of the driver.'),
  timeOfDay: z.string().describe('The current time of day (e.g., morning, afternoon, evening, night).'),
  tripHistory: z.string().describe('A summary of the driver\'s recent trip history.'),
});
export type SuggestDriverAdsInput = z.infer<typeof SuggestDriverAdsInputSchema>;

const SuggestDriverAdsOutputSchema = z.object({
  adSuggestion: z.string().describe('A relevant and non-intrusive ad suggestion for the driver.'),
});
export type SuggestDriverAdsOutput = z.infer<typeof SuggestDriverAdsOutputSchema>;

export async function suggestDriverAds(input: SuggestDriverAdsInput): Promise<SuggestDriverAdsOutput> {
  return suggestDriverAdsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDriverAdsPrompt',
  input: {schema: SuggestDriverAdsInputSchema},
  output: {schema: SuggestDriverAdsOutputSchema},
  prompt: `You are an AI assistant designed to suggest relevant and non-intrusive ads for rideshare drivers.

  Based on the driver's current location, the time of day, and their recent trip history, suggest an ad that would be helpful and not distracting to the driver.

  Location: {{{location}}}
  Time of Day: {{{timeOfDay}}}
  Trip History: {{{tripHistory}}}

  Ad Suggestion:`,
});

const suggestDriverAdsFlow = ai.defineFlow(
  {
    name: 'suggestDriverAdsFlow',
    inputSchema: SuggestDriverAdsInputSchema,
    outputSchema: SuggestDriverAdsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
