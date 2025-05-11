
"use client";
import LocationInputForm from "@/components/customer/location-input-form";
import ProtectedRoute from "@/components/protected-route";
import Image from "next/image";

export default function RequestTripPage() {
  return (
    <ProtectedRoute allowedRoles={['customer']}>
      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row items-start gap-8">
        <div className="w-full lg:w-1/2">
          <LocationInputForm />
        </div>
        <div className="w-full lg:w-1/2 mt-8 lg:mt-0">
          <div className="bg-card p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-primary mb-4">Vista Previa del Mapa en Vivo</h2>
            <div className="aspect-video bg-muted rounded-md overflow-hidden">
              <Image
                src="https://picsum.photos/800/450?random=1"
                alt="Mapa mostrando ruta simulada"
                width={800}
                height={450}
                className="object-cover w-full h-full"
                data-ai-hint="map city route"
                priority
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Tu ruta se mostrará aquí.
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

