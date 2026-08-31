import { supabase } from "@/lib/supabase/client";
import { formatCurrency, formatDate, formatDestination } from "@/lib/utils";
import Link from "next/link";
import { Plus, Calendar, MapPin, Wallet } from "lucide-react";
import Image from "next/image";
import { TripActions } from "@/components/trips/TripActions";

export const dynamic = "force-dynamic";

export default async function TripsPage(props: { searchParams: Promise<{ filter?: string }> }) {
  const resolvedParams = await props.searchParams;
  const filter = resolvedParams.filter || 'all';

  const { data: allTrips, error: tripsError } = await supabase
    .from('trips')
    .select('*, expenses(*)')
    .order('start_date', { ascending: false });

  if (tripsError) return <div className="p-8 text-red-500">Error cargando información.</div>;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parseLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Filtrado de viajes
  const trips = (allTrips || []).filter(trip => {
    const startDate = parseLocalDate(trip.start_date);
    const endDate = parseLocalDate(trip.end_date);
    
    if (filter === 'actuales') return startDate <= today && endDate >= today;
    if (filter === 'proximos') return startDate > today;
    if (filter === 'finalizados') return endDate < today;
    return true; // 'all'
  });

  return (
    <div className="p-4 md:p-8 w-full max-w-6xl mx-auto space-y-6 pb-24 md:pb-8">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Viajes</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona todos tus destinos y presupuestos</p>
        </div>
        <Link 
          href="/trips/new" 
          className="bg-brand text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-brand-hover transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden md:inline">Nuevo Viaje</span>
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Link 
          href="/trips" 
          className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-brand text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
        >
          Todos
        </Link>
        <Link 
          href="/trips?filter=actuales" 
          className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${filter === 'actuales' ? 'bg-brand text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
        >
          En Curso
        </Link>
        <Link 
          href="/trips?filter=proximos" 
          className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${filter === 'proximos' ? 'bg-brand text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
        >
          Próximos
        </Link>
        <Link 
          href="/trips?filter=finalizados" 
          className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${filter === 'finalizados' ? 'bg-brand text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
        >
          Finalizados
        </Link>
      </div>

      {/* Content */}
      {(!trips || trips.length === 0) ? (
        <div className="flex flex-col items-center justify-center h-[50vh] px-4 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="mb-6">
            <Image src="/icon.svg" alt="Tripflow" width={80} height={80} className="object-contain" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No hay viajes en esta categoría</h2>
          <p className="text-gray-500 mb-6 max-w-md">No se encontraron viajes que coincidan con tu búsqueda.</p>
          <Link href="/trips/new" className="bg-brand text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-hover shadow-sm">
            Crear Viaje
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip: any) => {
            const startDate = new Date(trip.start_date);
            const endDate = new Date(trip.end_date);
            
            let statusText = "En curso";
            let statusColor = "bg-green-100 text-green-700 border border-green-200";
            
            if (startDate > today) {
              statusText = "Próximo";
              statusColor = "bg-blue-100 text-blue-700 border border-blue-200";
            } else if (endDate < today) {
              statusText = "Finalizado";
              statusColor = "bg-gray-100 text-gray-600 border border-gray-200";
            }

            const totalBudget = trip.budget_limit;
            const totalSpent = trip.expenses.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
            const percentageSpent = Math.min((totalSpent / totalBudget) * 100, 100);

            return (
              <div key={trip.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col group">
                
                <div className="p-6 relative">
                  <div className="absolute top-6 right-6 flex items-center gap-2">
                    <TripActions trip={trip} status={statusText} />
                  </div>
                  
                  <div className="flex items-start gap-4 mb-4 pr-10">
                    <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0 group-hover:bg-brand group-hover:text-white transition-colors mt-1">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 leading-tight">{formatDestination(trip.destination)}</h3>
                      <div className="mt-2.5">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm ${statusColor}`}>
                          {statusText}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500 bg-gray-50 rounded-lg p-2.5">
                    <Calendar className="w-4 h-4 text-brand" />
                    <span>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
                  </div>
                </div>

                <div className="px-6 py-5 flex-1 flex flex-col justify-end bg-gray-50/50 border-t border-gray-50">
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-gray-400" /> Presupuesto
                    </span>
                    <span className="text-lg font-black text-gray-900">{formatCurrency(totalBudget, trip.currency)}</span>
                  </div>
                  
                  <div className="w-full bg-gray-200/80 rounded-full h-2.5 mb-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${percentageSpent > 90 ? 'bg-red-500' : percentageSpent > 75 ? 'bg-orange-500' : 'bg-brand'}`}
                      style={{ width: `${percentageSpent}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs font-semibold text-gray-500">
                    <span>Gastado: {formatCurrency(totalSpent, trip.currency)}</span>
                    <span className={percentageSpent > 90 ? 'text-red-500' : ''}>{percentageSpent.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
