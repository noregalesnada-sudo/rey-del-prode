'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function registerEnterprise(formData: FormData) {
  const companySlug = formData.get('company_slug') as string
  const email       = (formData.get('email') as string).toLowerCase().trim()
  const password    = formData.get('password') as string
  const username    = (formData.get('username') as string).trim()
  const first_name  = (formData.get('first_name') as string).trim()
  const last_name   = (formData.get('last_name') as string).trim()

  // 1. Verificar whitelist
  const { data: entry } = await adminClient
    .from('company_whitelist')
    .select('id, area, used')
    .eq('company_slug', companySlug)
    .eq('email', email)
    .single()

  if (!entry) {
    return { error: 'No es un mail válido para registrarse. Ponete en contacto con tu proveedor.' }
  }

  if (entry.used) {
    return { error: 'Este mail ya fue utilizado para registrarse.' }
  }

  // 2. Obtener el prode de la empresa
  const { data: company } = await adminClient
    .from('companies')
    .select('prode_id')
    .eq('slug', companySlug)
    .single()

  if (!company?.prode_id) return { error: 'Error de configuración. Contactá al administrador.' }

  const { data: prode } = await adminClient
    .from('prodes')
    .select('slug')
    .eq('id', company.prode_id)
    .single()

  // 3. Crear cuenta en Supabase Auth
  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  })

  if (authError) return { error: authError.message }
  if (!authData.user) return { error: 'No se pudo crear la cuenta.' }

  const userId = authData.user.id

  // 4. Guardar nombre/apellido en profiles
  await adminClient
    .from('profiles')
    .update({ first_name, last_name })
    .eq('id', userId)

  // 5. Unir al prode de la empresa con el área
  await adminClient.from('prode_members').insert({
    prode_id: company.prode_id,
    user_id: userId,
    role: 'player',
    status: 'active',
    area: entry.area,
  })

  // 6. Marcar whitelist como usada
  await adminClient
    .from('company_whitelist')
    .update({ used: true })
    .eq('id', entry.id)

  revalidatePath('/', 'layout')
  redirect(`/prode/${prode?.slug}`)
}
