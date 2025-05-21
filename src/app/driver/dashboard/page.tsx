
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Bike, ScissorsIcon, Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/protected-route";
// import { useAuth } from "@/contexts/auth-context"; // Para futuras integraciones de guardado de servicio

interface ServiceOption {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  // futurePath?: string; // Para futura navegación a dashboards específicos
}

const serviceOptions: ServiceOption[] = [
  {
    id: "restaurant",
    title: "Soy un Restaurante",
    description: "Ofrece tus deliciosos platos y expande tu alcance a más clientes.",
    icon: UtensilsCrossed,
    // futurePath: "/dashboard/restaurant/setup" 
  },
  {
    id: "delivery",
    title: "Soy un Repartidor",
    description: "Entrega pedidos y paquetes con flexibilidad y genera ingresos.",
    icon: Bike,
    // futurePath: "/dashboard/delivery/setup"
  },
  {
    id: "stylist",
    title: "Soy un Estilista",
    description: "Brinda servicios de belleza y estilismo, gestionando tus citas y clientes.",
    icon: ScissorsIcon,
    // futurePath: "/dashboard/stylist/setup"
  },
  {
    id: "taxi",
    title: "Soy un Taxista",
    description: "Transporta pasajeros de manera segura y eficiente por la ciudad.",
    icon: Car,
    // futurePath: "/dashboard/taxi/manage" 
  },
];

export default function ServiceSelectionPage() {
  const { toast } = useToast();
  const router = useRouter();
  // const { user /*, setSelectedService */ } = useAuth(); // Para el futuro

  const handleServiceSelection = (service: ServiceOption) => {
    toast({
      title: "¡Servicio Registrado!",
      description: `Has indicado que deseas operar como: ${service.title.toLowerCase()}. Próximamente podrás configurar los detalles.`,
    });
    // Lógica futura:
    // 1. Guardar el servicio seleccionado en el perfil del usuario (e.g., setSelectedService(service.id))
    // 2. Redirigir a un dashboard o página de configuración específica para ese servicio
    // if (service.futurePath) {
    //   router.push(service.futurePath);
    // }
    console.log("Usuario ha seleccionado el servicio:", service.id);
  };

  return (
    <ProtectedRoute allowedRoles={['driver']}> {/* Rol 'driver' es la puerta de entrada a la selección de servicios */}
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary tracking-tight sm:text-5xl">
            Únete a GoLibre Multiservicios
          </h1>
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
              {/* <CardFooter className="p-6 bg-card">
                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  onClick={(e) => { e.stopPropagation(); handleServiceSelection(service);}} // Evita que el onClick de la Card se dispare dos veces
                >
                  Seleccionar y Continuar
                </Button>
              </CardFooter> */}
            </Card>
          ))}
        </div>
         <p className="text-center text-muted-foreground mt-16 text-sm">
          Más servicios y funcionalidades se añadirán pronto. ¡Estamos construyendo el futuro de los servicios contigo!
        </p>
      </div>
    </ProtectedRoute>
  );
}
