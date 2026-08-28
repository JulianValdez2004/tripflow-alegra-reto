import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { NewTripForm } from "@/components/trips/NewTripForm";

export default function NewTripPage() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
      <Link href="/trips" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Regresar
      </Link>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">Crear Nuevo Viaje</h1>
      
      <NewTripForm />
    </div>
  );
}
