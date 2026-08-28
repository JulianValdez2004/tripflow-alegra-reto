'use server';

import { supabase } from '@/lib/supabase/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createExpense(formData: FormData) {
  const tripId = formData.get('tripId') as string;
  const title = formData.get('title') as string;
  const amount = Number(formData.get('amount'));
  const category = formData.get('category') as string;

  // Validación básica
  if (!tripId || !title || amount <= 0 || !category) {
    throw new Error('Faltan datos obligatorios para el gasto.');
  }

  const { error } = await supabase
    .from('expenses')
    .insert([{
      trip_id: tripId,
      title,
      amount,
      category
    }]);

  if (error) {
    console.error('Error al crear el gasto:', error);
    throw new Error('Error al registrar el gasto en la base de datos');
  }

  // Refrescamos la caché del dashboard para actualizar gráficos y listas
  revalidatePath('/dashboard');
  
  // Redirigimos al dashboard
  redirect('/dashboard');
}
