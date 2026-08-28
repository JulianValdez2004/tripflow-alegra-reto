import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileHeader } from "@/components/layout/MobileHeader";

export const metadata: Metadata = {
  title: "Tripflow | Control de Presupuesto",
  description: "Aplicación para el control de presupuesto de tus viajes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased flex flex-col md:flex-row h-[100dvh] overflow-hidden bg-background text-foreground">
        {/* Desktop Sidebar (oculto en mobile) */}
        <Sidebar />
        
        {/* Header en Mobile */}
        <MobileHeader />

        {/* Contenido Principal */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 w-full relative">
          {children}
        </main>

        {/* Mobile Bottom Nav (oculto en desktop) */}
        <BottomNav />
      </body>
    </html>
  );
}
