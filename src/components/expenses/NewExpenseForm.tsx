"use client";

import { useState, useRef } from "react";
import { 
  Loader2, UploadCloud, Receipt, X, AlertCircle,
  Utensils, Bus, Bed, Ticket, Plane, MoreHorizontal, Calendar as CalendarIcon, Wallet, Search
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
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CurrencyInput } from "@/components/ui/currency-input";

interface Trip {
  id: string;
  destination: string;
  budget_limit: number;
  currency: string;
  start_date: string;
  end_date: string;
  expenses: { amount: number }[];
  status: string;
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
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Estados para validación de sobregiro
  const [showOverdraftModal, setShowOverdraftModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [overdraftAmount, setOverdraftAmount] = useState(0);
  
  // Estado para el viaje seleccionado
  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const [tripSearch, setTripSearch] = useState("");
  const selectedTrip = trips.find(t => t.id === selectedTripId);

  // Estado para el monto
  const [amountVal, setAmountVal] = useState<number | "">("");

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

    // --- VALIDACIÓN DE SOBREGIRO ---
    const expenseAmount = Number(formData.get("amount"));
    if (selectedTrip) {
      const totalSpent = selectedTrip.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
      const available = selectedTrip.budget_limit - totalSpent;
      
      if (expenseAmount > available) {
        setOverdraftAmount(expenseAmount - available);
        setPendingFormData(formData);
        setShowOverdraftModal(true);
        setIsSubmitting(false); // Pausar submit real
        return; // Detenemos aquí, el usuario decidirá en el Modal
      }
    }

    // Si todo está bien (no hay sobregiro), ejecutamos directo
    await executeSubmit(formData);
  };

  const executeSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await createExpense(formData);
      toast.success("¡Gasto registrado!", { description: "Se ha descontado de tu presupuesto." });
      router.push('/dashboard');
    } catch (err: any) {
      toast.error("Error", { description: err.message || "Ocurrió un error al guardar el gasto." });
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
            <SelectContent className="rounded-xl max-h-72 p-1" alignItemWithTrigger={false}>
              <div className="p-2 sticky top-0 bg-white z-10 border-b border-gray-100 mb-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar viaje..."
                    value={tripSearch}
                    onChange={(e) => setTripSearch(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand/50 focus:border-brand transition-all"
                  />
                </div>
              </div>
              {trips.length === 0 && <div className="py-4 text-center text-sm text-gray-500">No tienes viajes (crea uno primero)</div>}
              {trips.filter(t => t.destination.toLowerCase().includes(tripSearch.toLowerCase())).length > 0 ? (
                trips.filter(t => t.destination.toLowerCase().includes(tripSearch.toLowerCase())).map(t => (
                  <SelectItem key={t.id} value={t.id} className="py-2.5 cursor-pointer">
                    {t.destination}
                  </SelectItem>
                ))
              ) : (
                trips.length > 0 && <div className="py-4 text-center text-sm text-gray-500">No se encontraron resultados</div>
              )}
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
              onChange={() => setErrors(prev => ({ ...prev, title: "" }))}
              onInvalid={(e) => {
                e.preventDefault();
                setErrors(prev => ({ ...prev, title: "Describe brevemente en qué gastaste el dinero." }));
              }}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all text-gray-700 h-12 ${
                errors.title ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-brand'
              }`}
              required
            />
            {errors.title && (
              <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.title}
              </p>
            )}
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
              <CurrencyInput 
                name="amount"
                placeholder="0.00"
                value={amountVal}
                currencySymbol={selectedTrip?.currency || "$"}
                onChange={(val) => {
                  setAmountVal(val);
                  setErrors(prev => ({ ...prev, amount: "" }));
                }}
                onInvalid={(e) => {
                  e.preventDefault();
                  setErrors(prev => ({ ...prev, amount: "Ingresa un monto válido." }));
                }}
                error={!!errors.amount}
                required
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.amount}
              </p>
            )}
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
                  disabled={
                    selectedTrip 
                      ? { after: new Date(new Date(selectedTrip.end_date).setMinutes(new Date(selectedTrip.end_date).getMinutes() + new Date(selectedTrip.end_date).getTimezoneOffset())) }
                      : false
                  }
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

      {/* OVERDRAFT MODAL */}
      {showOverdraftModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-100">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Presupuesto Superado</h3>
            <p className="text-gray-600 mb-8 text-sm md:text-base leading-relaxed">
              Este gasto supera el límite de presupuesto de tu viaje por <strong className="text-red-500 font-bold whitespace-nowrap">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: selectedTrip?.currency || 'USD', maximumFractionDigits: 0 }).format(overdraftAmount)}</strong>. ¿Deseas registrarlo de todas formas?
            </p>
            <div className="flex gap-3 w-full">
              <button 
                type="button"
                onClick={() => setShowOverdraftModal(false)} 
                className="flex-1 px-4 py-3 h-12 bg-gray-100 rounded-xl font-semibold text-gray-700 hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={() => {
                  setShowOverdraftModal(false);
                  if (pendingFormData) executeSubmit(pendingFormData);
                }} 
                className="flex-1 px-4 py-3 h-12 bg-brand text-white rounded-xl font-semibold hover:bg-brand-hover transition-colors shadow-md flex items-center justify-center"
              >
                Sí, registrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
