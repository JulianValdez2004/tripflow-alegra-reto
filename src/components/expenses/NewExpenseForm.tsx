"use client";

import { useState, useRef } from "react";
import { 
  Loader2, UploadCloud, Receipt, X, 
  Utensils, Bus, Bed, Ticket, Plane, MoreHorizontal, Calendar as CalendarIcon, Wallet
} from "lucide-react";
import { createExpense } from "@/actions/expense.actions";

// shadcn UI Select
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Trip {
  id: string;
  destination: string;
  budget_limit: number;
  currency: string;
  start_date: string;
  end_date: string;
  expenses: { amount: number }[];
}

const CATEGORIES = [
  { name: "Alimentación", icon: <Utensils className="w-4 h-4 mr-2 text-orange-500" /> },
  { name: "Transporte", icon: <Bus className="w-4 h-4 mr-2 text-blue-500" /> },
  { name: "Alojamiento", icon: <Bed className="w-4 h-4 mr-2 text-purple-500" /> },
  { name: "Entretenimiento", icon: <Ticket className="w-4 h-4 mr-2 text-pink-500" /> },
  { name: "Vuelos", icon: <Plane className="w-4 h-4 mr-2 text-cyan-500" /> },
  { name: "Otros", icon: <MoreHorizontal className="w-4 h-4 mr-2 text-gray-500" /> },
];

export function NewExpenseForm({ trips }: { trips: Trip[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Estado para el viaje seleccionado
  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const selectedTrip = trips.find(t => t.id === selectedTripId);

  // Estado para la categoría
  const [selectedCategory, setSelectedCategory] = useState<string>("Alimentación");
  
  // Estado para la fecha del gasto
  const [expenseDate, setExpenseDate] = useState<Date | undefined>(new Date());
  
  // Para el drag and drop / input file
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg("Por favor, selecciona solo imágenes (JPG, PNG).");
      return;
    }
    setErrorMsg("");
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    
    const formData = new FormData(e.currentTarget);
    
    // Como usamos shadcn Select, los valores no van automáticamente en el form si no los inyectamos
    // Inyectamos valores manuales
    formData.set("tripId", selectedTripId);
    formData.set("category", selectedCategory);
    if (expenseDate) {
      formData.set("date", format(expenseDate, 'yyyy-MM-dd'));
    }
    
    if (selectedFile) {
      formData.set("receipt", selectedFile);
    }
    
    if (!selectedTripId) {
      setErrorMsg("Debes seleccionar un viaje.");
      setIsSubmitting(false);
      return;
    }

    try {
      await createExpense(formData);
    } catch (err: any) {
      setErrorMsg(err.message || "Ocurrió un error al guardar el gasto.");
      setIsSubmitting(false);
    }
  };

  // Calcular métricas del viaje seleccionado
  const renderTripDetails = () => {
    if (!selectedTrip) return null;
    
    const totalSpent = selectedTrip.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const available = selectedTrip.budget_limit - totalSpent;
    const isOverBudget = available < 0;

    const formatCurrency = (val: number) => 
      new Intl.NumberFormat('es-CO', { style: 'currency', currency: selectedTrip.currency, maximumFractionDigits: 0 }).format(val);
    
    const formatDate = (dateString: string) => 
      new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(new Date(dateString));

    return (
      <div className="mt-3 p-4 bg-brand-light/50 border border-brand/20 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isOverBudget ? 'bg-red-100 text-red-600' : 'bg-brand/10 text-brand'}`}>
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Saldo Disponible</p>
            <p className={`text-lg font-bold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
              {formatCurrency(available)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand/10 text-brand">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Fechas del Viaje</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatDate(selectedTrip.start_date)} - {formatDate(selectedTrip.end_date)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* Viaje Asociado con Shadcn Select */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Viaje Asociado</label>
          <Select value={selectedTripId} onValueChange={(val) => val && setSelectedTripId(val)} required>
            <SelectTrigger className="w-full px-4 py-6 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all text-base">
              <span className={`flex-1 text-left line-clamp-1 ${!selectedTrip ? "text-muted-foreground" : ""}`}>
                {selectedTrip ? selectedTrip.destination : "Selecciona el viaje..."}
              </span>
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {trips.length === 0 && <SelectItem value="none" disabled>No tienes viajes (crea uno primero)</SelectItem>}
              {trips.map(t => (
                <SelectItem key={t.id} value={t.id} className="py-3 cursor-pointer">
                  {t.destination}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Detalles del viaje seleccionado (Etiqueta personalizada) */}
          {renderTripDetails()}
        </div>

        {/* Descripción y Categoría */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción del Gasto</label>
            <input 
              type="text" 
              name="title"
              placeholder="Ej. Cena en restaurante"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all text-gray-700 h-12"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría</label>
            <Select value={selectedCategory} onValueChange={(val) => val && setSelectedCategory(val)} required>
              <SelectTrigger className="w-full px-4 py-6 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all text-base">
                <div className="flex-1 text-left flex items-center">
                  {(() => {
                    const cat = CATEGORIES.find(c => c.name === selectedCategory);
                    return cat ? (
                      <>
                        {cat.icon}
                        <span>{cat.name}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Selecciona una categoría...</span>
                    );
                  })()}
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.name} value={cat.name} className="py-3 cursor-pointer">
                    <div className="flex items-center">
                      {cat.icon}
                      <span>{cat.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Monto y Fecha */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Monto</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-lg">$</span>
              <input 
                type="number" 
                name="amount"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all text-gray-700 text-lg font-medium h-14"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha del Gasto</label>
            <Popover>
              <PopoverTrigger className="w-full text-left">
                <div
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all text-base text-left flex items-center h-14 bg-white ${
                    !expenseDate ? "text-muted-foreground" : "text-gray-900"
                  }`}
                >
                  <CalendarIcon className="mr-3 h-5 w-5 text-gray-400" />
                  {expenseDate ? format(expenseDate, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={expenseDate}
                  onSelect={setExpenseDate}
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Recibo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Foto del Recibo (Opcional)</label>
          
          <div 
            className={`relative flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-dashed rounded-xl transition-all duration-200 overflow-hidden ${
              dragActive ? 'border-brand bg-brand-light' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !selectedFile && fileInputRef.current?.click()}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleChange}
            />

            {previewUrl ? (
              <div className="relative w-full h-full flex flex-col items-center p-4">
                <img src={previewUrl} alt="Preview" className="max-h-40 rounded-md object-contain mb-2 shadow-sm" />
                <button 
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); removeFile(); }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
                >
                  <X className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium text-gray-700 truncate max-w-[80%]">{selectedFile?.name}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center cursor-pointer">
                <div className="p-3 bg-white rounded-full shadow-sm mb-3 text-brand">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">Haz clic para tomar/elegir una foto</p>
                <p className="text-xs text-gray-500">O arrastra el recibo aquí (JPG, PNG)</p>
              </div>
            )}
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
            className="bg-brand hover:bg-brand-hover text-white font-semibold py-3 px-8 rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full md:w-auto h-12"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Guardando...</>
            ) : (
              <><Receipt className="w-5 h-5" /> Registrar Gasto</>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
