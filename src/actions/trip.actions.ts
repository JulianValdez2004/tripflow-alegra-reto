'use server';

import { supabase } from '@/lib/supabase/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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
