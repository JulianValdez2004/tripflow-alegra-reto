import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Combina y fusiona clases de Tailwind de forma segura
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un número como moneda (Ejemplo: $1,500.00)
 */
export function formatCurrency(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0, // No mostrar decimales si es entero
  }).format(amount);
}

/**
 * Calcula el porcentaje gastado del presupuesto total
 * @returns Un número entre 0 y 100
 */
export function calculateBudgetPercentage(spent: number, total: number) {
  if (total <= 0) return 0;
  const percentage = (spent / total) * 100;
  return Math.min(Math.max(percentage, 0), 100); // Mantiene el valor entre 0 y 100
}

/**
 * Formatea un rango de fechas de un viaje
 * @example "15 May - 22 May, 2024"
 */
export function formatTripDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startStr = format(start, "d MMM", { locale: es });
  const endStr = format(end, "d MMM, yyyy", { locale: es });
  
  return `${startStr} - ${endStr}`;
}

/**
 * Devuelve el tiempo relativo desde que se creó un gasto
 * @example "Hace 2 horas"
 */
export function formatRelativeTime(dateString: string) {
  return formatDistanceToNow(new Date(dateString), {
    addSuffix: true,
    locale: es,
  });
}
