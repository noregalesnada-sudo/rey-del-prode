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

function generateInviteCode(): string {
  // Sin O,0,I,1 para evitar confusiones
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function createProde(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const name = (formData.get('name') as string).trim()
  const description = (formData.get('description') as string | null)?.trim() ?? ''
  const requiresApproval = formData.get('requires_approval') === '1'
  const slug = slugify(name) + '-' + Math.random().toString(36).slice(2, 6)
  const invite_code = generateInviteCode()

  const { data: prode, error } = await adminClient
    .from('prodes')
    .insert({ name, slug, description, owner_id: user.id, invite_code, requires_approval: requiresApproval })
    .select('id, slug')
    .single()

  if (error) return { error: error.message }

  await adminClient.from('prode_members').insert({
    prode_id: prode.id,
    user_id: user.id,
    role: 'admin',
    status: 'active',
  })

  revalidatePath('/')
  redirect(`/prode/${prode.slug}`)
}

// Unirse por slug (desde link /unirse/[slug])
export async function joinProde(slug: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: prode } = await adminClient
    .from('prodes')
    .select('id, slug, requires_approval')
    .eq('slug', slug)
    .single()

  if (!prode) return { error: 'Prode no encontrado' }

  const { data: existing } = await adminClient
    .from('prode_members')
    .select('status')
    .eq('prode_id', prode.id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    revalidatePath('/')
    redirect(`/prode/${slug}`)
  }

  const status = prode.requires_approval ? 'pending' : 'active'

  const { error } = await adminClient
    .from('prode_members')
    .insert({ prode_id: prode.id, user_id: user.id, role: 'member', status })

  if (error) return { error: error.message }

  revalidatePath('/')
  redirect(`/prode/${slug}`)
}

// Unirse por código de 6 chars (desde modal en sidebar)
export async function joinProdeByCode(inviteCode: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: prode } = await adminClient
    .from('prodes')
    .select('id, slug, requires_approval')
    .eq('invite_code', inviteCode.toUpperCase().trim())
    .single()

  if (!prode) return { error: 'Código inválido. Verificá que esté bien escrito.' }

  const { data: existing } = await adminClient
    .from('prode_members')
    .select('status')
    .eq('prode_id', prode.id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    if (existing.status === 'pending') return { error: 'Tu solicitud ya está pendiente de aprobación.' }
    return { error: 'Ya sos parte de este prode.' }
  }

  const status = prode.requires_approval ? 'pending' : 'active'

  const { error } = await adminClient
    .from('prode_members')
    .insert({ prode_id: prode.id, user_id: user.id, role: 'member', status })

  if (error) return { error: error.message }

  revalidatePath('/')

  if (status === 'active') {
    redirect(`/prode/${prode.slug}`)
  }

  // Si está pendiente, devolvemos para que el cliente muestre mensaje
  return { pending: true, prodeName: prode.slug }
}

export async function approveMember(prodeId: string, userId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: membership } = await adminClient
    .from('prode_members')
    .select('role')
    .eq('prode_id', prodeId)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') return { error: 'Sin permisos' }

  await adminClient
    .from('prode_members')
    .update({ status: 'active' })
    .eq('prode_id', prodeId)
    .eq('user_id', userId)

  revalidatePath('/', 'layout')
}

export async function rejectMember(prodeId: string, userId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: membership } = await adminClient
    .from('prode_members')
    .select('role')
    .eq('prode_id', prodeId)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') return { error: 'Sin permisos' }

  await adminClient
    .from('prode_members')
    .delete()
    .eq('prode_id', prodeId)
    .eq('user_id', userId)

  revalidatePath('/', 'layout')
}
