
"use client"; // This component handles client-side state and interactions

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function DriverDashboardClientPart() {
  const [isAvailable, setIsAvailable] = useState(true);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-primary mb-4 sm:mb-0">Driver Dashboard</h1>
      <div className="flex items-center space-x-2 p-3 bg-card rounded-lg shadow">
        <Switch
          id="availability-toggle"
          checked={isAvailable}
          onCheckedChange={setIsAvailable}
          aria-label="Toggle availability"
        />
        <Label htmlFor="availability-toggle" className={`text-lg font-medium ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
          {isAvailable ? "Available for Rides" : "Unavailable"}
        </Label>
      </div>
    </div>
  );
}
