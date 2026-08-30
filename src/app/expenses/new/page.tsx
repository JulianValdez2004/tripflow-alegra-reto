import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { NewExpenseForm } from "@/components/expenses/NewExpenseForm";

// Forza que la ruta no se cacheé en build para que siempre cargue la lista fresca de viajes
export const dynamic = "force-dynamic";

export default async function NewExpensePage() {
  // Obtenemos los viajes con sus datos completos y sus gastos asociados para calcular el saldo
  const { data: trips, error } = await supabase
    .from('trips')
    .select('id, destination, budget_limit, currency, start_date, end_date, expenses(amount)')
    .order('created_at', { ascending: false });

  const todayStr = new Date().toISOString().split('T')[0];
  const activeTrips = trips?.filter(trip => trip.end_date >= todayStr) || [];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
      <Link href="/expenses" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Regresar
      </Link>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">Registrar Gasto</h1>
      
      {error ? (
        <div className="text-red-500 bg-red-50 p-4 rounded-xl">Error cargando viajes: {error.message}</div>
      ) : (
        <NewExpenseForm trips={activeTrips} />
      )}
    </div>
  );
}
