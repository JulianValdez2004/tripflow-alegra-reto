'use server';

import { supabase } from '@/lib/supabase/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createExpense(formData: FormData) {
  const tripId = formData.get('tripId') as string;
  const title = formData.get('title') as string;
  const amount = Number(formData.get('amount'));
  const category = formData.get('category') as string;
  const receiptFile = formData.get('receipt') as File | null;

  // Validación básica
  if (!tripId || !title || amount <= 0 || !category) {
    throw new Error('Faltan datos obligatorios para el gasto.');
  }

  let receiptUrl = null;

  // Procesar y subir el archivo si existe
  if (receiptFile && receiptFile.size > 0) {
    const fileExt = receiptFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    // Subir al bucket 'receipts'
    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(`public/${fileName}`, receiptFile);

    if (uploadError) {
      console.error('Error subiendo recibo:', uploadError);
      // Podríamos fallar o continuar sin recibo, por ahora fallamos para asegurar la integridad
      throw new Error('Error al subir la imagen del recibo.');
    } else {
      // Obtener la URL pública
      const { data } = supabase.storage.from('receipts').getPublicUrl(`public/${fileName}`);
      receiptUrl = data.publicUrl;
    }
  }

  const dateStr = formData.get('date') as string;

  const insertPayload: any = {
    trip_id: tripId,
    title,
    amount,
    category,
    receipt_url: receiptUrl
  };

  if (dateStr) {
    // Agregamos una hora media (12:00 PM) para evitar desfases de zona horaria al guardar en UTC
    insertPayload.created_at = `${dateStr}T12:00:00Z`;
  }

  const { error } = await supabase
    .from('expenses')
    .insert([insertPayload]);

  if (error) {
    console.error('Error al crear el gasto:', error);
    throw new Error('Error al registrar el gasto en la base de datos');
  }

  // Refrescamos la caché del dashboard para actualizar gráficos y listas
  revalidatePath('/dashboard');
  revalidatePath('/expenses');
  
  return { success: true };
}

export async function deleteExpense(expenseId: string) {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId);

  if (error) {
    console.error('Error al eliminar el gasto:', error);
    throw new Error('No se pudo eliminar el gasto.');
  }

  revalidatePath('/dashboard');
  revalidatePath('/expenses');
  return { success: true };
}

export async function updateExpense(expenseId: string, formData: FormData) {
  const title = formData.get('title') as string;
  const amount = Number(formData.get('amount'));
  const category = formData.get('category') as string;
  const dateStr = formData.get('date') as string;
  const receiptFile = formData.get('receipt') as File | null;

  if (!title || amount <= 0 || !category) {
    throw new Error('Faltan datos obligatorios o el monto es inválido.');
  }

  const updates: any = {
    title,
    amount,
    category
  };

  if (dateStr) {
    updates.created_at = `${dateStr}T12:00:00Z`;
  }

  if (receiptFile && receiptFile.size > 0) {
    const fileExt = receiptFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(`public/${fileName}`, receiptFile);

    if (uploadError) {
      throw new Error('Error al subir el nuevo recibo.');
    } else {
      const { data } = supabase.storage.from('receipts').getPublicUrl(`public/${fileName}`);
      updates.receipt_url = data.publicUrl;
    }
  }

  const { error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', expenseId);

  if (error) {
    console.error('Error al actualizar el gasto:', error);
    throw new Error('Error al actualizar el gasto en la base de datos');
  }

  revalidatePath('/dashboard');
  revalidatePath('/expenses');
  
  return { success: true };
}
