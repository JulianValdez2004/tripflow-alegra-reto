import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat('es-CO', { 
    style: 'currency', 
    currency,
    maximumFractionDigits: 0 
  }).format(amount);
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  // Ajustar problema de zona horaria al crear fechas desde strings YYYY-MM-DD
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  return new Intl.DateTimeFormat('es-ES', { 
    day: 'numeric', 
    month: 'short',
    year: 'numeric'
  }).format(date);
}
