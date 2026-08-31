'use server';

import { supabase } from '@/lib/supabase/client';
import { revalidatePath } from 'next/cache';
import { formatDestination, formatDate } from '@/lib/utils';

export async function createTrip(formData: FormData) {
  const destination = formData.get('destination') as string;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;
  const budgetLimit = Number(formData.get('budgetLimit'));
  const currency = formData.get('currency') as string || 'USD';

  // Validación básica
  if (!destination || !startDate || !endDate || budgetLimit <= 0) {
    return { error: 'Datos inválidos. Por favor revisa los campos.' };
  }

  // Verificar cruce de fechas
  const { data: existingTrips, error: fetchError } = await supabase
    .from('trips')
    .select('start_date, end_date, destination');

  if (fetchError) {
    return { error: 'Error al validar fechas con los viajes existentes.' };
  }

  const newStart = new Date(startDate);
  const newEnd = new Date(endDate);

  const overlappingTrip = existingTrips?.find(trip => {
    const tripStart = new Date(trip.start_date);
    const tripEnd = new Date(trip.end_date);
    
    // Hay solapamiento si la fecha de inicio nueva es menor o igual a la final del existente,
    // y la fecha final nueva es mayor o igual a la inicial del existente.
    return newStart <= tripEnd && newEnd >= tripStart;
  });

  if (overlappingTrip) {
    const formattedDest = formatDestination(overlappingTrip.destination);
    const startStr = formatDate(overlappingTrip.start_date);
    const endStr = formatDate(overlappingTrip.end_date);
    
    return { error: `Las fechas se cruzan con tu viaje a ${formattedDest} (${startStr} al ${endStr}). ¡Intenta con otras fechas!` };
  }

  const { error } = await supabase
    .from('trips')
    .insert([{
      destination,
      start_date: startDate,
      end_date: endDate,
      budget_limit: budgetLimit,
      currency
    }]);

  if (error) {
    console.error('Error al crear el viaje:', error);
    return { error: 'Error al guardar el viaje en la base de datos' };
  }

  // Refrescamos la caché
  revalidatePath('/dashboard');
  revalidatePath('/trips');
  
  return { success: true };
}

export async function deleteTrip(tripId: string) {
  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', tripId);

  if (error) {
    console.error('Error al eliminar el viaje:', error);
    return { error: 'No se pudo eliminar el viaje.' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/trips');
  revalidatePath('/expenses/new');
  return { success: true };
}

export async function updateTrip(tripId: string, formData: FormData) {
  const budgetLimit = Number(formData.get('budgetLimit'));
  const destination = formData.get('destination') as string;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;
  const currency = formData.get('currency') as string;
  
  if (budgetLimit <= 0) {
    return { error: 'El presupuesto debe ser mayor a cero.' };
  }

  const updates: any = { budget_limit: budgetLimit };

  // Si envían los demás datos (es un viaje próximo y pueden editarlos)
  if (destination && startDate && endDate && currency) {
    // Verificar cruce de fechas ignorando el viaje actual
    const { data: existingTrips, error: fetchError } = await supabase
      .from('trips')
      .select('id, start_date, end_date, destination')
      .neq('id', tripId); // Excluir este viaje

    if (fetchError) return { error: 'Error al validar fechas.' };

    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);

    const overlappingTrip = existingTrips?.find(trip => {
      const tripStart = new Date(trip.start_date);
      const tripEnd = new Date(trip.end_date);
      return newStart <= tripEnd && newEnd >= tripStart;
    });

    if (overlappingTrip) {
      const formattedDest = formatDestination(overlappingTrip.destination);
      const startStr = formatDate(overlappingTrip.start_date);
      const endStr = formatDate(overlappingTrip.end_date);
      return { error: `Las fechas se cruzan con tu viaje a ${formattedDest} (${startStr} al ${endStr}).` };
    }

    updates.destination = destination;
    updates.start_date = startDate;
    updates.end_date = endDate;
    updates.currency = currency;
  }

  const { error } = await supabase
    .from('trips')
    .update(updates)
    .eq('id', tripId);

  if (error) {
    console.error('Error al actualizar el viaje:', error);
    return { error: 'Error al actualizar el viaje en la base de datos' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/trips');
  
  return { success: true };
}
