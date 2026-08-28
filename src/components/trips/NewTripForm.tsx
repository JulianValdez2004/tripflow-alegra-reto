"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { createTrip } from "@/actions/trip.actions";

import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { format } from "date-fns";

export function NewTripForm() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar el dropdown al hacer clic fuera de él
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Buscar destinos usando la API gratuita de Nominatim (OpenStreetMap)
  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
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
  }, [query]);

  const handleSelectPlace = (placeName: string) => {
    setQuery(placeName);
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    
    if (!dateRange?.from || !dateRange?.to) {
      setErrorMsg("Por favor selecciona las fechas de inicio y fin del viaje.");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("destination", query);
    formData.set("startDate", format(dateRange.from, 'yyyy-MM-dd'));
    formData.set("endDate", format(dateRange.to, 'yyyy-MM-dd'));
    
    try {
      await createTrip(formData);
    } catch (err: any) {
      setErrorMsg(err.message || "Ocurrió un error al guardar.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* Destino */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Destino</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              name="destination"
              placeholder="Buscar destino..." 
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all"
              required
            />
          </div>
          
          {/* Autocomplete Dropdown */}
          {showDropdown && (results.length > 0 || loading) && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Buscando lugares...
                </div>
              ) : (
                results.map((place, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPlace(place.display_name)}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                  >
                    {place.display_name}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Fechas - Range Picker */}
        <div className="w-full">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Fechas del Viaje</label>
          <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
        </div>

        {/* Presupuesto y Moneda */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Presupuesto</label>
            <input 
              type="number" 
              name="budgetLimit"
              step="0.01"
              min="1"
              placeholder="0.00"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Moneda</label>
            <select 
              name="currency"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all bg-white text-gray-700"
              defaultValue="USD"
            >
              <option value="USD">USD - Dólar Estadounidense</option>
              <option value="COP">COP - Peso Colombiano</option>
              <option value="EUR">EUR - Euro</option>
              <option value="MXN">MXN - Peso Mexicano</option>
            </select>
          </div>
        </div>

        {errorMsg && (
          <div className="text-red-500 text-sm font-medium">{errorMsg}</div>
        )}

        {/* Botón Guardar */}
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand hover:bg-brand-hover text-white font-semibold py-3 px-8 rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Creando...</>
            ) : (
              "Crear Viaje"
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
