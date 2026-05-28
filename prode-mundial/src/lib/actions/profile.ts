'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function changePassword(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const newPassword     = (formData.get('new_password') as string)
  const confirmPassword = (formData.get('confirm_password') as string)

  if (!newPassword || newPassword.length < 6) return { error: 'La contraseña debe tener al menos 6 caracteres' }
  if (newPassword !== confirmPassword) return { error: 'Las contraseñas no coinciden' }

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { error: error.message }

  return { success: true }
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const username   = (formData.get('username') as string).trim()
  const first_name = (formData.get('first_name') as string).trim()
  const last_name  = (formData.get('last_name') as string).trim()

  if (!username) return { error: 'El nombre de usuario es obligatorio' }

  const { error } = await supabase
    .from('profiles')
    .update({ username, first_name, last_name })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  return { success: true }
}
