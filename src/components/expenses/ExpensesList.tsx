"use client";

import { useState } from "react";
import { formatCurrency, formatDate, formatDestination } from "@/lib/utils";
import { MapPin, X, Receipt as ReceiptIcon } from "lucide-react";
import Image from "next/image";
import { CategoryIcon } from "@/components/dashboard/CategoryIcon";
import { ExpenseActions } from "@/components/expenses/ExpenseActions";

export function ExpensesList({ expenses }: { expenses: any[] }) {
  const [selectedExpense, setSelectedExpense] = useState<any | null>(null);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);

  return (
    <>
      <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 text-sm font-semibold text-gray-900 px-4">Fecha</th>
                <th className="pb-3 text-sm font-semibold text-gray-900 px-4">Categoría</th>
                <th className="pb-3 text-sm font-semibold text-gray-900 px-4">Descripción</th>
                <th className="pb-3 text-sm font-semibold text-gray-900 px-4">Viaje</th>
                <th className="pb-3 text-sm font-semibold text-gray-900 px-4 text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp: any) => (
                <tr 
                  key={exp.id} 
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedExpense(exp)}
                >
                  <td className="py-4 text-sm text-gray-500 px-4">
                    {new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(exp.created_at))}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                      <CategoryIcon category={exp.category} className="w-4 h-4" />
                      {exp.category}
                    </div>
                  </td>
                  <td className="py-4 text-sm text-gray-600 px-4 font-medium">{exp.title}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-brand bg-brand/10 px-2 py-1 rounded-md w-fit">
                      <MapPin className="w-3 h-3" />
                      {formatDestination(exp.trips?.destination) || 'Desconocido'}
                    </div>
                  </td>
                  <td className="py-4 text-sm font-bold text-gray-900 px-4 text-right flex justify-end items-center gap-2">
                    {exp.receipt_url && <ReceiptIcon className="w-4 h-4 text-gray-300" />}
                    <span className="text-brand">-{formatCurrency(Number(exp.amount), exp.trips?.currency || 'USD')}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List */}
        <div className="block md:hidden space-y-4">
          {expenses.map((exp: any) => (
            <div 
              key={exp.id} 
              className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0 cursor-pointer active:bg-gray-50 transition-colors p-2 -mx-2 rounded-xl gap-2"
              onClick={() => setSelectedExpense(exp)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <CategoryIcon category={exp.category} className="w-8 h-8" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-bold text-gray-900 truncate pr-2">{exp.title}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-semibold text-brand bg-brand/10 px-1.5 py-0.5 rounded-md flex items-center gap-1 flex-shrink-0">
                      <MapPin className="w-2.5 h-2.5" />
                      <span className="truncate max-w-[80px]">{formatDestination(exp.trips?.destination)}</span>
                    </span>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' }).format(new Date(exp.created_at))}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0 pl-2">
                <span className="font-bold text-brand whitespace-nowrap">-{formatCurrency(Number(exp.amount), exp.trips?.currency || 'USD')}</span>
                {exp.receipt_url && <ReceiptIcon className="w-3.5 h-3.5 text-gray-400" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nequi-style Modal para Detalles del Gasto */}
      {selectedExpense && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in"
            onClick={() => setSelectedExpense(null)}
          />
          
          <div className="bg-white rounded-3xl w-full max-w-md relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden shadow-2xl flex flex-col max-h-[80vh] md:max-h-[90vh]">
            
            {/* Header del Ticket */}
            <div className="bg-white p-5 flex flex-col items-center justify-center border-b border-gray-100 relative">
              <div className="absolute top-4 left-4">
                <ExpenseActions 
                  expense={selectedExpense} 
                  isFinished={new Date(selectedExpense.trips?.end_date) < new Date(new Date().setHours(0,0,0,0))} 
                  onClose={() => setSelectedExpense(null)} 
                />
              </div>
              
              <button 
                onClick={() => setSelectedExpense(null)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2">
                <Image src="/icon.svg" alt="Tripflow Logo" width={32} height={32} />
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Tripflow</h3>
              </div>
            </div>

            {/* Contenido del Ticket */}
            <div className="p-6 overflow-y-auto">
              <div className="text-center mb-8">
                <p className="text-sm font-medium text-gray-500 mb-1">Total Pagado</p>
                <p className="text-4xl font-black text-gray-900">
                  {formatCurrency(Number(selectedExpense.amount), selectedExpense.trips?.currency || 'USD')}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-dashed border-gray-200">
                  <span className="text-gray-500 text-sm">Descripción</span>
                  <span className="font-semibold text-gray-900">{selectedExpense.title}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-dashed border-gray-200">
                  <span className="text-gray-500 text-sm">Categoría</span>
                  <div className="flex items-center gap-2">
                    <CategoryIcon category={selectedExpense.category} className="w-3.5 h-3.5" />
                    <span className="font-semibold text-gray-900">{selectedExpense.category}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-dashed border-gray-200">
                  <span className="text-gray-500 text-sm">Viaje</span>
                  <span className="font-semibold text-gray-900 bg-brand/10 text-brand px-2 py-0.5 rounded-md">
                    {formatDestination(selectedExpense.trips?.destination) || 'Desconocido'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-dashed border-gray-200">
                  <span className="text-gray-500 text-sm">Fecha y Hora</span>
                  <span className="font-medium text-gray-900">
                    {new Intl.DateTimeFormat('es-ES', { 
                      day: '2-digit', month: 'short', year: 'numeric', 
                      hour: '2-digit', minute: '2-digit' 
                    }).format(new Date(selectedExpense.created_at))}
                  </span>
                </div>
              </div>

              {selectedExpense.receipt_url && (
                <div className="mt-8">
                  <p className="text-sm font-bold text-gray-700 mb-3 text-center uppercase tracking-wider">Factura Adjunta</p>
                  <button 
                    onClick={() => setIsImageFullscreen(true)}
                    className="w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex justify-center p-2 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <Image 
                      src={selectedExpense.receipt_url} 
                      alt="Factura" 
                      width={300} 
                      height={400} 
                      className="object-contain max-h-[200px] rounded-lg"
                      unoptimized
                    />
                  </button>
                </div>
              )}
            </div>
            
            {/* Base del Ticket (Dientes) */}
            <div className="bg-brand text-white text-center py-4 text-sm font-bold shadow-[0_-10px_20px_rgba(255,52,130,0.2)]">
              Gasto Registrado con Éxito
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Viewer */}
      {isImageFullscreen && selectedExpense?.receipt_url && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 animate-in fade-in">
          <button 
            onClick={() => setIsImageFullscreen(false)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="relative w-full h-full max-w-4xl max-h-screen flex items-center justify-center p-4">
            <Image 
              src={selectedExpense.receipt_url} 
              alt="Factura Fullscreen" 
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      )}
    </>
  );
}
