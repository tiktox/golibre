import Image from 'next/image';

interface MiniMapPlaceholderProps {
  locationName: string;
  type: 'origin' | 'destination';
  className?: string;
}

export default function MiniMapPlaceholder({ locationName, type, className }: MiniMapPlaceholderProps) {
  const hint = type === 'origin' ? 'pickup map' : 'dropoff map';
  return (
    <div className={`bg-muted rounded-lg overflow-hidden shadow ${className}`}>
      <Image
        src={`https://picsum.photos/seed/${encodeURIComponent(locationName)}/300/200`}
        alt={`${type} map placeholder for ${locationName}`}
        width={300}
        height={200}
        className="w-full h-auto object-cover"
        data-ai-hint={hint}
      />
      <div className="p-2 text-xs text-center text-muted-foreground">
        Map for {locationName} ({type})
      </div>
    </div>
  );
}
