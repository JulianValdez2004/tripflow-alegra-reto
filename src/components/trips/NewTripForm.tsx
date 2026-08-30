"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { createTrip } from "@/actions/trip.actions";

import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function NewTripForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [currencySearch, setCurrencySearch] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const [currencies, setCurrencies] = useState<{ code: string; name: string }[]>([]);
  // Cerrar el calendario al hacer clic fuera de él
  useEffect(() => {
    if (typeof window !== "undefined" && typeof Intl !== "undefined" && Intl.supportedValuesOf) {
          const formatter = new Intl.DisplayNames(['es'], { type: 'currency' });
          const currencyList = Intl.supportedValuesOf('currency').map(code => {
            const rawName = formatter.of(code);
            const capitalizedName = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : code;
            return { code, name: capitalizedName };
          });
          setCurrencies(currencyList);
    }
  }, []);

  // Buscar destinos usando la API gratuita de Nominatim (OpenStreetMap)
  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }
    
    // Si el texto actual coincide con el destino seleccionado, no volvemos a buscar
    if (query === selectedDestination) {
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
  }, [query, selectedDestination]);

  const handleSelectPlace = (placeName: string) => {
    setQuery(placeName);
    setSelectedDestination(placeName);
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!selectedDestination || query !== selectedDestination) {
      toast.error("Destino inválido", { description: "Debes seleccionar un destino de la lista desplegable." });
      setIsSubmitting(false);
      return;
    }
    
    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Faltan fechas", { description: "Por favor selecciona las fechas de inicio y fin del viaje." });
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("destination", selectedDestination);
    formData.set("startDate", format(dateRange.from, 'yyyy-MM-dd'));
    formData.set("endDate", format(dateRange.to, 'yyyy-MM-dd'));
    formData.set("currency", selectedCurrency);
    
    const loadingToast = toast.loading("Creando viaje...");

    try {
      await createTrip(formData);
      toast.dismiss(loadingToast);
      toast.success("¡Viaje creado!", { description: "Tu viaje se ha registrado correctamente." });
      router.push('/trips');
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error("Error al crear el viaje", { description: err.message || "Ocurrió un error al guardar." });
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

        {/* Fechas - Range Picker */}
        <div className="w-full">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Fechas del Viaje</label>
          <DatePickerWithRange 
            date={dateRange} 
            onDateChange={setDateRange} 
            disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
          />
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
            <Select value={selectedCurrency} onValueChange={(val) => val && setSelectedCurrency(val)} required>
              <SelectTrigger className="w-full px-4 py-6 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all text-base bg-white text-gray-700">
                <span className="flex-1 text-left line-clamp-1">
                  {(() => {
                    const found = currencies.find(c => c.code === selectedCurrency);
                    return found ? `${found.code} - ${found.name}` : selectedCurrency;
                  })()}
                </span>
              </SelectTrigger>
              <SelectContent className="rounded-xl max-h-72 p-1" alignItemWithTrigger={false}>
                <div className="p-2 sticky top-0 bg-white z-10 border-b border-gray-100 mb-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Buscar divisa..."
                      value={currencySearch}
                      onChange={(e) => setCurrencySearch(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand/50 focus:border-brand transition-all"
                    />
                  </div>
                </div>
                {currencies.filter(c => 
                  c.code.toLowerCase().includes(currencySearch.toLowerCase()) || 
                  c.name.toLowerCase().includes(currencySearch.toLowerCase())
                ).length > 0 ? (
                  currencies.filter(c => 
                    c.code.toLowerCase().includes(currencySearch.toLowerCase()) || 
                    c.name.toLowerCase().includes(currencySearch.toLowerCase())
                  ).map(({ code, name }) => (
                    <SelectItem key={code} value={code} className="py-2.5 cursor-pointer">
                      {code} - {name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="py-4 text-center text-sm text-gray-500">No se encontraron resultados</div>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>



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
