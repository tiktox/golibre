"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Bike, ScissorsIcon, Car, Building } from "lucide-react"; // Added Building
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context"; // Import useAuth

interface ServiceOption {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  path?: string; 
  authPath?: string;
}

const serviceOptions: ServiceOption[] = [
  {
    id: "restaurant",
    title: "Soy un Restaurante",
    description: "Ofrece tus deliciosos platos y expande tu alcance a más clientes.",
    icon: Building,
    path: "/services/restaurant/profile",
    authPath: "/auth?service=restaurant&next=/services/restaurant/profile"
  },
  {
    id: "delivery",
    title: "Soy un Repartidor",
    description: "Entrega pedidos y paquetes con flexibilidad y genera ingresos.",
    icon: Bike,
    authPath: "/auth?service=delivery&next=/services/delivery/profile" // Example path
  },
  {
    id: "stylist",
    title: "Soy un Estilista",
    description: "Brinda servicios de belleza y estilismo, gestionando tus citas y clientes.",
    icon: ScissorsIcon,
    authPath: "/auth?service=stylist&next=/services/stylist/profile" // Example path
  },
  {
    id: "taxi",
    title: "Soy un Taxista",
    description: "Transporta pasajeros de manera segura y eficiente por la ciudad.",
    icon: Car,
    authPath: "/auth?service=taxi&next=/services/taxi/profile" // Example path
  },
];

export default function ServiceSelectionPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading: authLoading, isInitializing } = useAuth(); // Get user from useAuth

  const handleServiceSelection = (service: ServiceOption) => {
    if (authLoading || isInitializing) return; // Do nothing if auth state is still loading

    if (user) { // If user is authenticated
      toast({
        title: "¡Servicio Seleccionado!",
        description: `Has indicado que deseas operar como: ${service.title.toLowerCase()}.`,
      });
      if (service.path) {
        router.push(service.path);
      } else {
        console.log("Usuario autenticado ha seleccionado el servicio (sin ruta específica):", service.id);
        // Potentially redirect to a generic dashboard or show more info
      }
    } else { // If user is NOT authenticated
      if (service.authPath) {
        router.push(service.authPath);
      } else {
        // Fallback if no authPath is defined, though it should be
        router.push("/auth");
      }
    }
  };
  
  // Optional: Show a loading state while auth is initializing
  if (isInitializing) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>Cargando servicios...</p>
      </div>
    );
  }

  return (
    // No ProtectedRoute wrapper here
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
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
  );
}
