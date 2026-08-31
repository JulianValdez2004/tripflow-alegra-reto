import { supabase } from "@/lib/supabase/client";
import { formatCurrency, formatDate, formatDestination } from "@/lib/utils";
import Link from "next/link";
import { Plane, Plus, Wallet, TrendingUp, AlertCircle, ArrowRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardChart } from "@/components/dashboard/DashboardChart";
import { CategoryIcon } from "@/components/dashboard/CategoryIcon";
import { FloatingActionButton } from "@/components/dashboard/FloatingActionButton";

import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { data: trips, error: tripsError } = await supabase
    .from('trips')
    .select('*, expenses(*)')
    .order('start_date', { ascending: true });

  if (tripsError) return <div className="p-8 text-red-500">Error cargando información.</div>;

  if (!trips || trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] px-4 text-center">
        <div className="mb-6">
          <Image src="/icon.svg" alt="Tripflow" width={80} height={80} className="object-contain" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Bienvenido a Tripflow!</h2>
        <p className="text-gray-500 mb-8 max-w-md">Comienza creando tu primer viaje.</p>
        <Link href="/trips/new" className="bg-brand text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-hover">
          Crear mi primer viaje
        </Link>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let statusText = "En curso";
  let statusColor = "bg-green-100 text-green-700";

  let activeTrip = trips.find(t => new Date(t.start_date) <= today && new Date(t.end_date) >= today);
  
  if (!activeTrip) {
    activeTrip = trips.find(t => new Date(t.start_date) > today);
    if (activeTrip) {
      statusText = "Próximo a iniciar";
      statusColor = "bg-blue-100 text-blue-700";
    }
  }

  if (!activeTrip) {
    activeTrip = trips.sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime())[0];
    statusText = "Finalizado";
    statusColor = "bg-gray-100 text-gray-600";
  }

  const totalBudget = activeTrip.budget_limit;
  const totalSpent = activeTrip.expenses.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
  const percentageSpent = Math.min((totalSpent / totalBudget) * 100, 100);
  const remaining = totalBudget - totalSpent;
  const isOverBudget = remaining < 0;

  const endDate = new Date(activeTrip.end_date);
  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const remainingDays = diffDays > 0 ? diffDays : 0;

  // Helper to capitalize first letter
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  // Agrupar gastos por día para la gráfica
  const groupedExpenses = activeTrip.expenses.reduce((acc: any, exp: any) => {
    // Tomamos la fecha cruda YYYY-MM-DD directamente de la base de datos para ignorar zonas horarias
    const dateStr = exp.created_at.substring(0, 10);
    const dateKey = dateStr;
    
    if (!acc[dateKey]) {
      // Creamos una fecha local a la medianoche para evitar desfases al formatear en el servidor
      const [y, m, d] = dateStr.split('-').map(Number);
      const localDate = new Date(y, m - 1, d);
      
      acc[dateKey] = {
        date: localDate, // guardamos para el sort
        dayLabel: capitalize(new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(localDate)),
        fullDate: capitalize(new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }).format(localDate)),
        amount: 0
      };
    }
    acc[dateKey].amount += Number(exp.amount);
    return acc;
  }, {});

  const expensesChartData = Object.values(groupedExpenses)
    .sort((a: any, b: any) => a.date.getTime() - b.date.getTime())
    .map((item: any) => ({
      rawDate: item.date.toISOString(),
      dayLabel: item.dayLabel,
      fullDate: item.fullDate,
      amount: item.amount
    }));

  if (expensesChartData.length === 0) {
    const todayLabel = capitalize(new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(today));
    const todayFull = capitalize(new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }).format(today));
    expensesChartData.push({ rawDate: today.toISOString(), dayLabel: todayLabel, fullDate: todayFull, amount: 0 }); 
  }

  const recentExpenses = [...activeTrip.expenses]
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="p-4 md:p-8 w-full max-w-6xl mx-auto space-y-6 pb-24 md:pb-8 relative min-h-screen">
      
      {/* ROW 1: Presupuesto Total */}
      <div className="bg-white border border-brand/20 p-6 rounded-2xl shadow-sm">
        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Presupuesto Total</h2>
          <span className="text-sm font-bold text-gray-700">{percentageSpent.toFixed(0)}%</span>
        </div>
        
        {/* Mobile Header */}
        <div className="flex md:hidden justify-between items-start mb-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Presupuesto Total</h2>
            <p className="text-sm text-gray-500">
              Gastado: <span className="font-semibold text-brand">{formatCurrency(totalSpent, activeTrip.currency)}</span>
            </p>
            <p className="text-sm text-gray-500">
              Total: {formatCurrency(totalBudget, activeTrip.currency)}
            </p>
          </div>
          <span className="text-2xl font-black text-brand">{percentageSpent.toFixed(0)}%</span>
        </div>
        
        {/* Progress Bar (Only Desktop) */}
        <div className="hidden md:block w-full bg-brand/10 rounded-full h-3 mb-3">
          <div 
            className="bg-brand h-full rounded-full transition-all duration-1000"
            style={{ width: `${percentageSpent}%` }}
          />
        </div>
        
        <p className="hidden md:block text-sm text-gray-500">
          Gastado: <span className="font-semibold text-gray-700">{formatCurrency(totalSpent, activeTrip.currency)}</span> 
          {' '}/ Total: {formatCurrency(totalBudget, activeTrip.currency)}
        </p>
      </div>

      {/* ROW 2: Gastos Actuales (Chart) & Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Gráfica */}
        <div className="lg:col-span-2 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex flex-col">
          <DashboardChart data={expensesChartData} currency={activeTrip.currency} />
        </div>

        {/* Columna Derecha: Tarjetas */}
        <div className="space-y-6 flex flex-col h-full">
          
          <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex flex-col justify-center">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Viaje Actual</h3>
            
            <div className="border border-brand/20 rounded-xl p-4 bg-brand/5">
              {/* Status Badge in Card */}
              <div className="mb-3">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                  {statusText}
                </span>
              </div>
              
              <p className="text-xl font-bold text-gray-900 line-clamp-1">{formatDestination(activeTrip.destination)}</p>
              <p className="text-sm text-gray-500 mt-1">{formatDate(activeTrip.start_date)} - {formatDate(activeTrip.end_date)}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex-1 flex flex-col justify-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Días Restantes</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-brand">{statusText === "Finalizado" ? 0 : remainingDays}</span>
              <span className="text-gray-500 font-medium">días</span>
            </div>
          </div>

        </div>
      </div>

      {/* ROW 3: Gastos Recientes */}
      <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Gastos Recientes</h2>
          {/* Desktop Link */}
          <Link href="/expenses" className="hidden md:inline-flex bg-brand text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-hover transition-colors">
            Ver Todos
          </Link>
          {/* Mobile Link */}
          <Link href="/expenses" className="inline-flex md:hidden text-brand text-sm font-bold hover:text-brand-hover">
            Ver Todos
          </Link>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 text-sm font-semibold text-gray-900 px-4">Fecha</th>
                <th className="pb-3 text-sm font-semibold text-gray-900 px-4">Categoría</th>
                <th className="pb-3 text-sm font-semibold text-gray-900 px-4">Descripción</th>
                <th className="pb-3 text-sm font-semibold text-gray-900 px-4">Monto</th>
              </tr>
            </thead>
            <tbody>
              {recentExpenses.length > 0 ? (
                recentExpenses.map((exp: any) => (
                  <tr key={exp.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 text-sm text-gray-500 px-4">
                      {new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(exp.created_at))}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                        <CategoryIcon category={exp.category} className="w-4 h-4" />
                        {exp.category}
                      </div>
                    </td>
                    <td className="py-4 text-sm text-gray-600 px-4">{exp.title}</td>
                    <td className="py-4 text-sm font-bold text-gray-900 px-4">
                      <span className="text-brand">-{formatCurrency(Number(exp.amount), activeTrip.currency)}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500 text-sm">
                    No hay gastos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile List */}
        <div className="block md:hidden space-y-4">
          {recentExpenses.length > 0 ? (
            recentExpenses.map((exp: any) => (
              <div key={exp.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <CategoryIcon category={exp.category} className="w-5 h-5" />
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900">{exp.title}</span>
                    <span className="text-xs text-gray-500">Categoría {exp.category}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-bold text-brand">-{formatCurrency(Number(exp.amount), activeTrip.currency)}</span>
                  <span className="text-xs text-gray-500">
                    {new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(exp.created_at))}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 text-sm py-4">No hay gastos registrados.</p>
          )}
        </div>
      </div>

      {/* Botón Flotante interactivo (Nequi-style) */}
      <FloatingActionButton />

    </div>
  );
}
