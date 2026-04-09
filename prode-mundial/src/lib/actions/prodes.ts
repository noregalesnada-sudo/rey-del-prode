'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function createProde(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const name = (formData.get('name') as string).trim()
  const description = (formData.get('description') as string | null)?.trim() ?? ''
  const slug = slugify(name) + '-' + Math.random().toString(36).slice(2, 6)

  const { data: prode, error } = await adminClient
    .from('prodes')
    .insert({ name, slug, description, owner_id: user.id })
    .select('id, slug')
    .single()

  if (error) return { error: error.message }

  // El creador es automáticamente admin
  await adminClient.from('prode_members').insert({
    prode_id: prode.id,
    user_id: user.id,
    role: 'admin',
  })

  revalidatePath('/')
  redirect(`/prode/${prode.slug}`)
}

export async function joinProde(slug: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: prode } = await supabase
    .from('prodes')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!prode) return { error: 'Prode no encontrado' }

  const { error } = await supabase
    .from('prode_members')
    .insert({ prode_id: prode.id, user_id: user.id, role: 'player' })

  if (error) {
    if (error.code === '23505') return { error: 'Ya sos parte de este prode' }
    return { error: error.message }
  }

  revalidatePath('/')
  redirect(`/prode/${slug}`)
}
