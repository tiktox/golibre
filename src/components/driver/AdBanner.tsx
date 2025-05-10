import { intelligentAdDisplay, type IntelligentAdDisplayInput } from '@/ai/flows/intelligent-ad-display';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Info } from 'lucide-react';
import type { AdData } from '@/lib/types';

interface AdBannerProps {
  driverStatus: 'WAITING' | 'COMPLETING';
  tripHistory?: string; // Optional, can be a summary
}

// This is a Server Component
export default async function AdBanner({ driverStatus, tripHistory }: AdBannerProps) {
  const adInput: IntelligentAdDisplayInput = {
    driverStatus,
    timeOfDay: new Date().toISOString(),
    tripHistory: tripHistory || "No recent trip history available.",
  };

  let adData: AdData | null = null;
  let error: string | null = null;

  try {
    adData = await intelligentAdDisplay(adInput);
  } catch (e: any) {
    console.error("Error fetching ad data:", e);
    error = e.message || "Failed to load advertisement.";
  }

  if (error) {
    return (
      <Card className="mt-6 border-destructive bg-destructive/10">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-5 w-5" /> Ad Service Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!adData || !adData.displayAd) {
    return null; // No ad to display or ad service decided not to show one
  }

  return (
    <Card className="mt-6 bg-secondary/50 border-primary/30 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg text-primary flex items-center">
            <Info size={20} className="mr-2" />
            Sponsored Message
        </CardTitle>
        {adData.reason && <CardDescription className="text-xs italic pt-1">{adData.reason}</CardDescription>}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground">{adData.adContent}</p>
      </CardContent>
    </Card>
  );
}
