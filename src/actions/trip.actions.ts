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
    throw new Error('Datos inválidos. Por favor revisa los campos.');
  }

  // Verificar cruce de fechas
  const { data: existingTrips, error: fetchError } = await supabase
    .from('trips')
    .select('start_date, end_date, destination');

  if (fetchError) {
    throw new Error('Error al validar fechas con los viajes existentes.');
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
    
    // throw new Error se enviará al Client Component y será atrapado en el catch() para mostrar en el Toast
    throw new Error(`Las fechas se cruzan con tu viaje a ${formattedDest} (${startStr} al ${endStr}). ¡Intenta con otras fechas!`);
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
    throw new Error('Error al guardar el viaje en la base de datos');
  }

  // Refrescamos la caché
  revalidatePath('/dashboard');
  revalidatePath('/trips');
  
  return { success: true };
}
