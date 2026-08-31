"use client";

import { useState } from "react";
import { MoreHorizontal, Edit2, Trash2, AlertTriangle, Loader2, X, Camera, Image as ImageIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { deleteExpense, updateExpense } from "@/actions/expense.actions";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyInput } from "@/components/ui/currency-input";

const CATEGORIES = ["Alimentación", "Transporte", "Alojamiento", "Actividades", "Compras", "Otros"];

export function ExpenseActions({ expense, isFinished, onClose }: { expense: any, isFinished: boolean, onClose: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit form states
  const [title, setTitle] = useState(expense.title);
  const [amount, setAmount] = useState(expense.amount);
  const [category, setCategory] = useState(expense.category);
  const [dateStr, setDateStr] = useState(expense.created_at.split('T')[0]);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  if (isFinished) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteExpense(expense.id);
      if (res?.error) {
        throw new Error(res.error);
      }
      toast.success("Gasto eliminado");
      setShowDeleteModal(false);
      onClose(); // Close the parent receipt modal
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
    formData.set("title", title);
    formData.set("amount", amount.toString());
    formData.set("category", category);
    formData.set("date", dateStr);
    
    if (receiptFile) {
      formData.set("receipt", receiptFile);
    }

    try {
      const res = await updateExpense(expense.id, formData);
      if (res?.error) {
        throw new Error(res.error);
      }
      toast.success("Gasto actualizado correctamente");
      setShowEditModal(false);
      onClose(); // Close parent to refresh data
    } catch (error: any) {
      toast.error("Error al actualizar", { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors outline-none">
          <MoreHorizontal className="w-5 h-5 pointer-events-none" />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-48 p-1 rounded-xl shadow-lg border-gray-100 bg-white z-[60]">
          <button 
            onClick={() => { setIsOpen(false); setShowEditModal(true); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4 text-gray-400" />
            Editar gasto
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

      {/* Delete Modal */}
      {showDeleteModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-100">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">¿Eliminar Gasto?</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Estás a punto de borrar este gasto por <strong className="text-gray-700">{expense.amount} {expense.trips?.currency}</strong>.
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

      {/* Edit Modal */}
      {showEditModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Editar Gasto</h3>
              <button 
                type="button"
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto flex flex-col gap-5">
              
              {/* Título */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Monto */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Monto</label>
                  <div className="relative">
                    <CurrencyInput 
                      value={amount}
                      onChange={(val) => setAmount(val)}
                      currencySymbol={expense.trips?.currency || "$"}
                      required
                    />
                  </div>
                </div>

                {/* Fecha */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha</label>
                  <input 
                    type="date" 
                    value={dateStr}
                    max={
                      expense.trips?.end_date && expense.trips.end_date < new Date().toISOString().split('T')[0]
                        ? expense.trips.end_date 
                        : new Date().toISOString().split('T')[0]
                    }
                    onChange={(e) => setDateStr(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all"
                    required
                  />
                </div>
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría</label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="w-full px-4 py-6 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all text-base bg-white text-gray-700">
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-60" alignItemWithTrigger={false}>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat} className="py-3 cursor-pointer">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Recibo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Actualizar Recibo (Opcional)</label>
                <div className="flex gap-2">
                  <input
                    id={`gallery-input-${expense.id}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return setReceiptFile(null);
                      
                      const image = new Image();
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        image.src = ev.target?.result as string;
                        image.onload = () => {
                          const canvas = document.createElement('canvas');
                          const MAX_SIZE = 800;
                          let { width, height } = image;
                          if (width > height && width > MAX_SIZE) {
                            height *= MAX_SIZE / width; width = MAX_SIZE;
                          } else if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height; height = MAX_SIZE;
                          }
                          canvas.width = width; canvas.height = height;
                          canvas.getContext('2d')?.drawImage(image, 0, 0, width, height);
                          canvas.toBlob((blob) => {
                            if (blob) setReceiptFile(new File([blob], file.name, { type: 'image/jpeg' }));
                          }, 'image/jpeg', 0.7);
                        };
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); document.getElementById(`gallery-input-${expense.id}`)?.click(); }}
                    className="w-full py-4 px-4 bg-brand/10 text-brand rounded-xl font-bold hover:bg-brand/20 transition-colors flex items-center justify-center gap-2"
                  >
                    Escoge Tu Foto
                  </button>
                </div>
                {receiptFile && (
                  <p className="text-sm font-medium text-brand mt-2">NUEVO: {receiptFile.name}</p>
                )}
                {expense.receipt_url && !receiptFile && (
                  <p className="text-xs text-gray-400 mt-2">Ya tienes un recibo adjunto. Sube uno nuevo solo si deseas reemplazarlo.</p>
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
