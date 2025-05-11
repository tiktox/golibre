import { suggestDriverAds, type SuggestDriverAdsInput } from '@/ai/flows/ad-suggestion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Sparkles, ExternalLink } from "lucide-react";
import Image from 'next/image';

async function getAdSuggestion() {
  const input: SuggestDriverAdsInput = {
    location: "18.4861° N, 69.9312° W", // Santo Domingo
    timeOfDay: new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening",
    tripHistory: "Completed 3 short trips in the city center, 1 long trip to the airport.",
  };

  try {
    const result = await suggestDriverAds(input);
    return result;
  } catch (error) {
    console.error("Error fetching ad suggestion:", error);
    return null;
  }
}

export default async function AdSuggestionDisplay() {
  const suggestionData = await getAdSuggestion();

  if (!suggestionData) {
    return (
      <Card className="w-full shadow-md border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertTriangle className="h-5 w-5 mr-2" /> Ad Suggestion Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive-foreground">
            We couldn't fetch an ad suggestion at this time. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // For a more engaging ad, we can parse the suggestion or use a fixed format.
  // Here, we'll assume the suggestion is a single string.
  // Let's create a mock title and image based on keywords.
  const adText = suggestionData.adSuggestion;
  let adTitle = "Special Offer!";
  let adImageUrl = "https://picsum.photos/seed/ad/400/200";
  let dataAiHint = "advertisement generic";

  if (adText.toLowerCase().includes("coffee")) {
    adTitle = "Coffee Break Discount!";
    adImageUrl = "https://picsum.photos/seed/coffeead/400/200";
    dataAiHint = "coffee shop";
  } else if (adText.toLowerCase().includes("gas") || adText.toLowerCase().includes("fuel")) {
    adTitle = "Save on Fuel!";
    adImageUrl = "https://picsum.photos/seed/gasstation/400/200";
    dataAiHint = "gas station";
  } else if (adText.toLowerCase().includes("food") || adText.toLowerCase().includes("restaurant")) {
     adTitle = "Hungry? Grab a Bite!";
     adImageUrl = "https://picsum.photos/seed/foodad/400/200";
     dataAiHint = "restaurant food";
  }


  return (
    <Card className="w-full shadow-lg border-2 border-accent/50 hover:shadow-xl transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl text-accent flex items-center">
            <Sparkles className="h-6 w-6 mr-2" /> {adTitle}
          </CardTitle>
          <span className="text-xs uppercase font-semibold text-muted-foreground">AD</span>
        </div>
        <CardDescription>A special tip just for you, powered by AI.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="aspect-video bg-muted rounded-md overflow-hidden border relative">
            <Image 
              src={adImageUrl}
              alt={adTitle}
              layout="fill"
              objectFit="cover"
              data-ai-hint={dataAiHint}
            />
        </div>
        <p className="text-sm text-foreground leading-relaxed">
          {adText}
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent/10 hover:text-accent">
          Learn More <ExternalLink className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
}
