import { supabase } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Plane, Plus } from "lucide-react";
import { DashboardChart } from "@/components/dashboard/DashboardChart";
import { CategoryIcon } from "@/components/dashboard/CategoryIcon";

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
        <Plane className="w-16 h-16 text-gray-300 mb-4" />
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

  let activeTrip = trips.find(t => new Date(t.start_date) <= today && new Date(t.end_date) >= today) || 
                   trips.find(t => new Date(t.start_date) > today) || 
                   trips.sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime())[0];

  const totalBudget = activeTrip.budget_limit;
  const totalSpent = activeTrip.expenses.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
  const percentageSpent = Math.min((totalSpent / totalBudget) * 100, 100);

  // Calcular dias restantes
  const endDate = new Date(activeTrip.end_date);
  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const remainingDays = diffDays > 0 ? diffDays : 0;

  // Preparar datos para el chart (agrupar gastos por día)
  // Como simplificación para la UI, mostramos los últimos gastos en formato de gráfica
  const expensesChartData = activeTrip.expenses
    .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((exp: any) => ({
      name: new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(new Date(exp.created_at)),
      amount: Number(exp.amount)
    }));

  if (expensesChartData.length === 0) {
    expensesChartData.push({ name: 'Hoy', amount: 0 }); // Datos dummy para gráfica vacía
  }

  // Últimos gastos para la tabla
  const recentExpenses = [...activeTrip.expenses]
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="p-4 md:p-8 w-full max-w-6xl mx-auto space-y-6">
      
      {/* ROW 1: Presupuesto Total */}
      <div className="bg-white border border-brand/20 p-6 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Presupuesto Total</h2>
          <span className="text-sm font-bold text-gray-700">{percentageSpent.toFixed(0)}%</span>
        </div>
        
        <div className="w-full bg-brand/10 rounded-full h-3 mb-3">
          <div 
            className="bg-brand h-full rounded-full transition-all duration-1000"
            style={{ width: `${percentageSpent}%` }}
          />
        </div>
        
        <p className="text-sm text-gray-500">
          Gastado: <span className="font-semibold text-gray-700">{formatCurrency(totalSpent, activeTrip.currency)}</span> 
          {' '}/ Total: {formatCurrency(totalBudget, activeTrip.currency)}
        </p>
      </div>

      {/* ROW 2: Gastos Actuales (Chart) & Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Gráfica (2/3) */}
        <div className="lg:col-span-2 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Gastos Actuales</h2>
            <select className="border border-gray-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-brand bg-white text-gray-600">
              <option>Este Mes</option>
              <option>Última Semana</option>
            </select>
          </div>
          <DashboardChart data={expensesChartData} />
        </div>

        {/* Columna Derecha: Tarjetas (1/3) */}
        <div className="space-y-6 flex flex-col">
          
          <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Viaje Actual</h3>
            <div className="border border-brand/20 rounded-xl p-4 bg-brand/5">
              <p className="text-lg font-bold text-gray-900">{activeTrip.destination}</p>
              <p className="text-sm text-gray-500 mt-1">{formatDate(activeTrip.start_date)} - {formatDate(activeTrip.end_date)}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex-1 flex flex-col justify-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Días Restantes</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-brand">{remainingDays}</span>
              <span className="text-gray-500 font-medium">días</span>
            </div>
          </div>

        </div>
      </div>

      {/* ROW 3: Gastos Recientes Table */}
      <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Gastos Recientes</h2>
          <Link href="/expenses/new" className="bg-brand text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-hover transition-colors">
            Ver Todo
          </Link>
        </div>

        <div className="overflow-x-auto">
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
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CategoryIcon category={exp.category} className="w-4 h-4 text-brand" />
                        {exp.category}
                      </div>
                    </td>
                    <td className="py-4 text-sm text-gray-600 px-4">{exp.title}</td>
                    <td className="py-4 text-sm font-bold text-gray-900 px-4">
                      {formatCurrency(Number(exp.amount), activeTrip.currency)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500 text-sm">
                    No hay gastos registrados para este viaje.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
