import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { Plus } from "lucide-react";
import Image from "next/image";
import { ExpensesList } from "@/components/expenses/ExpensesList";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const { data: expenses, error } = await supabase
    .from('expenses')
    .select('*, trips(id, destination, currency, start_date, end_date)')
    .order('created_at', { ascending: false });

  if (error) return <div className="p-8 text-red-500">Error cargando información.</div>;

  return (
    <div className="p-4 md:p-8 w-full max-w-6xl mx-auto space-y-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Gastos</h1>
          <p className="text-sm text-gray-500 mt-1">Historial de todos tus gastos registrados</p>
        </div>
        <Link 
          href="/expenses/new" 
          className="bg-brand text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-brand-hover transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden md:inline">Nuevo Gasto</span>
        </Link>
      </div>

      {/* Content */}
      {(!expenses || expenses.length === 0) ? (
        <div className="flex flex-col items-center justify-center h-[50vh] px-4 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="mb-6">
            <Image src="/icon.svg" alt="Tripflow" width={80} height={80} className="object-contain" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Aún no hay gastos</h2>
          <p className="text-gray-500 mb-6 max-w-md">Registra tus compras y pagos para llevar el control de tus viajes.</p>
          <Link href="/expenses/new" className="bg-brand text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-hover shadow-sm">
            Registrar Gasto
          </Link>
        </div>
      ) : (
        <ExpensesList expenses={expenses} />
      )}
    </div>
  );
}
