
"use client";
import ProtectedRoute from "@/components/protected-route";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ShoppingBag, History, UserCircle } from "lucide-react";

export default function CustomerDashboardPage() {
  const router = useRouter();

  return (
    <ProtectedRoute allowedRoles={['customer']}>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Panel del Cliente</h1>
          <p className="text-muted-foreground">Gestiona tus pedidos y preferencias.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ShoppingBag className="h-6 w-6 text-accent" />
                Realizar un Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Explora restaurantes y servicios para realizar un nuevo pedido.
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => router.push('/customer/request-trip')}> {/* Placeholder, adjust path */}
                Empezar Pedido
              </Button>
            </CardFooter>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <History className="h-6 w-6 text-accent" />
                Historial de Pedidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Revisa tus pedidos anteriores y su estado.
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => router.push('/customer/history')}> {/* Placeholder */}
                Ver Historial
              </Button>
            </CardFooter>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <UserCircle className="h-6 w-6 text-accent" />
                Mi Perfil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Actualiza tu información personal y preferencias.
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => router.push('/customer/profile')}> {/* Placeholder */}
                Editar Perfil
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
