
"use client";

import { Suspense } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Bike, ScissorsIcon, Car, Users, HardHat, Store, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/protected-route";
// import AdSuggestionDisplay from "@/components/driver/ad-suggestion-display"; // Example of server component
// import DriverDashboardClientPart from "@/components/driver/driver-dashboard-client-part"; // Client component part

interface ServiceOption {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const serviceOptions: ServiceOption[] = [
  {
    id: "restaurant",
    title: "Soy un Restaurante",
    description: "Ofrece tus deliciosos platos y expande tu alcance a más clientes.",
    icon: UtensilsCrossed,
  },
  {
    id: "delivery",
    title: "Soy un Repartidor",
    description: "Entrega pedidos y paquetes con flexibilidad y genera ingresos.",
    icon: Bike,
  },
  {
    id: "stylist",
    title: "Soy un Estilista",
    description: "Brinda servicios de belleza y estilismo, gestionando tus citas y clientes.",
    icon: ScissorsIcon,
  },
  {
    id: "taxi",
    title: "Soy un Taxista",
    description: "Transporta pasajeros de manera segura y eficiente por la ciudad.",
    icon: Car,
  },
];

export default function ServiceSelectionPage() {
  const { toast } = useToast();
  const router = useRouter();

  const handleServiceSelection = (service: ServiceOption) => {
    toast({
      title: "¡Servicio Registrado!",
      description: `Has indicado que deseas operar como: ${service.title.toLowerCase()}. Próximamente podrás configurar los detalles.`,
    });
    // Future logic: save selected service to user profile, redirect to specific dashboard
    console.log("Usuario ha seleccionado el servicio:", service.id);
  };

  return (
    <ProtectedRoute allowedRoles={['driver']}>
      {/* <DriverDashboardClientPart /> */} {/* Example of client component rendering */}
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          {/* Title "Únete a GoLibre Multiservicios" removed */}
          <p className="mt-4 text-xl text-foreground">
            Elige cómo quieres generar ingresos y conectar con clientes.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {serviceOptions.map((service) => (
            <Card
              key={service.id}
              className="shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out cursor-pointer group border-2 border-transparent hover:border-primary/50 flex flex-col overflow-hidden rounded-xl"
              onClick={() => handleServiceSelection(service)}
            >
              <CardHeader className="flex flex-row items-center gap-4 p-6 bg-card">
                <div className="p-3 rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <service.icon className="h-8 w-8 sm:h-10 sm:w-10" />
                </div>
                <CardTitle className="text-xl sm:text-2xl text-primary group-hover:text-accent transition-colors">
                  {service.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex-grow bg-card">
                <CardDescription className="text-base text-muted-foreground">
                  {service.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
         <p className="text-center text-muted-foreground mt-16 text-sm">
          Más servicios y funcionalidades se añadirán pronto. ¡Estamos construyendo el futuro de los servicios contigo!
        </p>
      </div>

      {/* This is where you could add async server components wrapped in Suspense if needed */}
      {/* <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <Suspense fallback={
            <Card className="w-full shadow-md">
              <CardHeader><CardTitle>Loading Ad...</CardTitle></CardHeader>
              <CardContent><div className="h-24 bg-muted rounded animate-pulse"></div></CardContent>
            </Card>
          }>
          <AdSuggestionDisplay />
        </Suspense>
      </div> */}
    </ProtectedRoute>
  );
}
