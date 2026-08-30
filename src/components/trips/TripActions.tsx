"use client";

import { useState, useEffect } from "react";
import { MoreHorizontal, Edit2, Trash2, AlertTriangle, Loader2, X, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { deleteTrip, updateTrip } from "@/actions/trip.actions";
import { toast } from "sonner";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { CurrencyInput } from "@/components/ui/currency-input";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { createPortal } from "react-dom";

export function TripActions({ trip, status }: { trip: any, status: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados del formulario de edición
  const isOngoing = status === "En curso";
  const [budgetLimit, setBudgetLimit] = useState(trip.budget_limit);
  
  // Para próximos viajes
  const [destination, setDestination] = useState(trip.destination);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date(trip.start_date).setMinutes(new Date(trip.start_date).getMinutes() + new Date(trip.start_date).getTimezoneOffset())),
    to: new Date(new Date(trip.end_date).setMinutes(new Date(trip.end_date).getMinutes() + new Date(trip.end_date).getTimezoneOffset()))
  });
  const [currency, setCurrency] = useState(trip.currency);
  const [currencies, setCurrencies] = useState<{ code: string; name: string }[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof Intl !== "undefined" && Intl.supportedValuesOf) {
      const formatter = new Intl.DisplayNames(['es'], { type: 'currency' });
      const currencyList = Intl.supportedValuesOf('currency').map(code => {
        const rawName = formatter.of(code);
        return { code, name: rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : code };
      });
      setCurrencies(currencyList);
    }
  }, []);

  // Autocomplete states
  const [query, setQuery] = useState(trip.destination);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }
    
    if (query === destination) {
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&featuretype=city`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Error fetching places", err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query, destination]);

  const handleSelectPlace = (placeName: string) => {
    setQuery(placeName);
    setDestination(placeName);
    setShowDropdown(false);
  };

  // Si está finalizado, no mostramos nada
  if (status === "Finalizado") return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTrip(trip.id);
      toast.success("Viaje eliminado", { description: "El viaje y sus gastos han sido borrados." });
      setShowDeleteModal(false);
    } catch (error: any) {
      toast.error("Error", { description: error.message });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("budgetLimit", budgetLimit.toString());
    
    if (!isOngoing) {
      if (!destination || query !== destination || !dateRange?.from || !dateRange?.to) {
        toast.error("Datos inválidos", { description: "Selecciona un destino de la lista y las fechas requeridas." });
        setIsSubmitting(false);
        return;
      }
      formData.set("destination", destination);
      formData.set("startDate", format(dateRange.from, 'yyyy-MM-dd'));
      formData.set("endDate", format(dateRange.to, 'yyyy-MM-dd'));
      formData.set("currency", currency);
    }

    try {
      await updateTrip(trip.id, formData);
      toast.success("Viaje actualizado", { description: "Los cambios se guardaron correctamente." });
      setShowEditModal(false);
    } catch (error: any) {
      toast.error("Error al actualizar", { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors z-10 text-gray-400 hover:text-gray-700 outline-none">
          <MoreHorizontal className="w-5 h-5 pointer-events-none" />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-48 p-1 rounded-xl shadow-lg border-gray-100 bg-white">
          <button 
            onClick={() => { setIsOpen(false); setShowEditModal(true); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4 text-gray-400" />
            Editar viaje
          </button>
          <button 
            onClick={() => { setIsOpen(false); setShowDeleteModal(true); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
            Eliminar
          </button>
        </PopoverContent>
      </Popover>

      {/* Modal de Eliminar */}
      {showDeleteModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-100">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">¿Eliminar Viaje?</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Esta acción no se puede deshacer. Se borrará el viaje a <strong className="text-gray-700">{trip.destination}</strong> y <strong>todos los gastos</strong> asociados a él.
            </p>
            <div className="flex gap-3 w-full">
              <button 
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de Editar */}
      {showEditModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Editar Viaje</h3>
                {isOngoing && <p className="text-xs font-medium text-brand mt-1 bg-brand/10 px-2 py-0.5 rounded-full inline-block">Viaje en curso: Solo presupuesto editable</p>}
              </div>
              <button 
                type="button"
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto flex flex-col gap-5">
              
              {/* Destino */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Destino</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="text" 
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    disabled={isOngoing}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all disabled:bg-gray-100 disabled:text-gray-500"
                    required
                  />
                </div>
                
                {/* Autocomplete Dropdown */}
                {showDropdown && !isOngoing && (results.length > 0 || loading) && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-y-auto p-1">
                    {loading ? (
                      <div className="py-4 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Buscando lugares...
                      </div>
                    ) : (
                      results.map((place, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectPlace(place.display_name)}
                          className="w-full text-left px-2 py-2.5 text-sm hover:bg-gray-100 rounded-md transition-colors"
                        >
                          {place.display_name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Fechas */}
              <div className="w-full">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fechas del Viaje</label>
                {isOngoing ? (
                  <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 text-sm">
                    {format(new Date(new Date(trip.start_date).setMinutes(new Date(trip.start_date).getMinutes() + new Date(trip.start_date).getTimezoneOffset())), "MMM dd, yyyy")} - {format(new Date(new Date(trip.end_date).setMinutes(new Date(trip.end_date).getMinutes() + new Date(trip.end_date).getTimezoneOffset())), "MMM dd, yyyy")}
                  </div>
                ) : (
                  <DatePickerWithRange 
                    date={dateRange} 
                    onDateChange={setDateRange} 
                    disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
                  />
                )}
              </div>

              {/* Presupuesto */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Presupuesto Límite</label>
                <div className="relative">
                  <CurrencyInput 
                    value={budgetLimit}
                    onChange={(val) => setBudgetLimit(val)}
                    currencySymbol={trip.currency || "$"}
                    required
                  />
                </div>
              </div>

              {/* Moneda */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Moneda</label>
                {isOngoing ? (
                  <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 text-sm">
                    {currency}
                  </div>
                ) : (
                  <Select value={currency} onValueChange={setCurrency} required>
                    <SelectTrigger className="w-full px-4 py-6 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all text-base bg-white text-gray-700">
                      <span className="flex-1 text-left line-clamp-1">
                        {(() => {
                          const found = currencies.find(c => c.code === currency);
                          return found ? `${found.code} - ${found.name}` : currency;
                        })()}
                      </span>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl max-h-60" alignItemWithTrigger={false}>
                      {currencies.length > 0 ? (
                        currencies.map(({ code, name }) => (
                          <SelectItem key={code} value={code} className="py-3 cursor-pointer">
                            {code} - {name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value={currency} className="py-3 cursor-pointer">{currency}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Acciones */}
              <div className="pt-4 flex gap-3 mt-2 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-brand hover:bg-brand-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Guardar Cambios"}
                </button>
              </div>

            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
