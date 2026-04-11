'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  const next = (formData.get('next') as string | null)?.trim()
  redirect(next && next.startsWith('/') ? next : '/')
}

export async function register(formData: FormData) {
  const supabase = await createClient()

  const email      = formData.get('email') as string
  const password   = formData.get('password') as string
  const username   = formData.get('username') as string
  const first_name = (formData.get('first_name') as string)?.trim() || null
  const last_name  = (formData.get('last_name') as string)?.trim() || null

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  })

  if (error) return { error: error.message }

  // Guardar nombre y apellido en profiles si se proporcionaron
  if (data.user && (first_name || last_name)) {
    await supabase
      .from('profiles')
      .update({ first_name, last_name })
      .eq('id', data.user.id)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
