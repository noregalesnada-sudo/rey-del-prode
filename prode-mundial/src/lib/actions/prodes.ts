'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { MercadoPagoConfig, Preference } from 'mercadopago'

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

const PLAN_PRICES: Record<string, number> = { pro: 19999, business: 199999 }
const PLAN_LABELS: Record<string, string> = { pro: 'Plan Pro', business: 'Plan Business' }

export async function createProde(formData: FormData): Promise<{ error?: string; slug?: string; mpUrl?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const name = (formData.get('name') as string).trim()
  const description = (formData.get('description') as string | null)?.trim() ?? ''
  const requiresApproval = formData.get('requires_approval') === '1'
  const plan = (formData.get('plan') as string | null) ?? 'free'
  const validPlan = ['free', 'pro', 'business'].includes(plan) ? plan : 'free'
  const promoCode = ((formData.get('promo_code') as string | null) ?? '').trim().toUpperCase()

  const slug = slugify(name) + '-' + Math.random().toString(36).slice(2, 6)
  const invite_code = generateInviteCode()

  // Siempre se crea con 'free' — el plan pago se activa solo cuando el webhook confirma el pago
  const { data: prode, error } = await adminClient
    .from('prodes')
    .insert({
      name, slug, description, owner_id: user.id,
      invite_code, requires_approval: requiresApproval,
      plan: 'free',
    })
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

  // Plan pago: verificar código promo primero
  if (validPlan !== 'free') {
    const promoPro = (process.env.PROMO_CODE_PRO ?? '').toUpperCase()
    const promoBusiness = (process.env.PROMO_CODE_BUSINESS ?? '').toUpperCase()
    const promoValid =
      (validPlan === 'pro' && promoPro && promoCode === promoPro) ||
      (validPlan === 'business' && promoBusiness && promoCode === promoBusiness)

    if (promoValid) {
      // Código válido: activar plan sin pago
      await adminClient.from('prodes').update({ plan: validPlan }).eq('id', prode.id)
      return { slug: prode.slug }
    }

    // Sin código válido: redirigir a MercadoPago
    try {
      const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! })
      const preference = new Preference(mp)
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

      const result = await preference.create({
        body: {
          items: [{
            id: validPlan,
            title: `${PLAN_LABELS[validPlan]} — Rey del Prode (Copa 2026)`,
            quantity: 1,
            unit_price: PLAN_PRICES[validPlan],
            currency_id: 'ARS',
          }],
          external_reference: `${prode.id}:${validPlan}`,
          back_urls: {
            success: `${appUrl}/prode/${prode.slug}?pago=ok`,
            failure: `${appUrl}/prode/${prode.slug}?pago=error`,
            pending: `${appUrl}/prode/${prode.slug}?pago=pendiente`,
          },
          auto_return: 'approved',
          notification_url: `${appUrl}/api/mp/webhook`,
        },
      })

      const mpUrl = result.init_point

      return { slug: prode.slug, mpUrl: mpUrl ?? undefined }
    } catch {
      // Si MP falla, igual tenemos el prode creado — devolvemos slug para no perder el prode
      return { slug: prode.slug, error: 'Prode creado pero hubo un error al iniciar el pago. Contactanos.' }
    }
  }

  return { slug: prode.slug }
}

const PLAN_LIMITS: Record<string, number> = { free: 25, pro: 50, business: 300 }

async function getActiveMemberCount(prodeId: string): Promise<number> {
  const { count } = await adminClient
    .from('prode_members')
    .select('*', { count: 'exact', head: true })
    .eq('prode_id', prodeId)
    .eq('status', 'active')
  return count ?? 0
}

// Unirse por slug (desde link /unirse/[slug]) — devuelve resultado, no hace redirect
export async function joinProde(slug: string): Promise<{ error?: string; slug?: string; pending?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No estás autenticado. Iniciá sesión e intentá de nuevo.' }

  const { data: prode } = await adminClient
    .from('prodes')
    .select('id, slug, requires_approval, plan')
    .eq('slug', slug)
    .single()

  if (!prode) return { error: 'Prode no encontrado.' }

  const { data: existing } = await adminClient
    .from('prode_members')
    .select('status')
    .eq('prode_id', prode.id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    revalidatePath('/')
    return { slug }
  }

  const limit = PLAN_LIMITS[prode.plan ?? 'free']
  const activeCount = await getActiveMemberCount(prode.id)
  if (activeCount >= limit) {
    return { error: `Este prode alcanzó el límite de ${limit} jugadores.` }
  }

  const status = prode.requires_approval ? 'pending' : 'active'

  const { error } = await adminClient
    .from('prode_members')
    .insert({ prode_id: prode.id, user_id: user.id, role: 'player', status })

  if (error) return { error: error.message }

  revalidatePath('/')
  if (status === 'pending') return { pending: true }
  return { slug }
}

// Unirse por código de 6 chars (desde modal en sidebar)
export async function joinProdeByCode(inviteCode: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: prode } = await adminClient
    .from('prodes')
    .select('id, slug, requires_approval, plan')
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

  const limit = PLAN_LIMITS[prode.plan ?? 'free']
  const activeCount = await getActiveMemberCount(prode.id)
  if (activeCount >= limit) {
    return { error: `Este prode alcanzó el límite de ${limit} jugadores.` }
  }

  const status = prode.requires_approval ? 'pending' : 'active'

  const { error } = await adminClient
    .from('prode_members')
    .insert({ prode_id: prode.id, user_id: user.id, role: 'player', status })

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

  // Verificar que no se supere el límite del plan antes de aprobar
  const { data: prode } = await adminClient
    .from('prodes')
    .select('plan')
    .eq('id', prodeId)
    .single()

  const limit = PLAN_LIMITS[prode?.plan ?? 'free']
  const activeCount = await getActiveMemberCount(prodeId)
  if (activeCount >= limit) {
    return { error: `El prode alcanzó el límite de ${limit} jugadores del plan actual.` }
  }

  await adminClient
    .from('prode_members')
    .update({ status: 'active' })
    .eq('prode_id', prodeId)
    .eq('user_id', userId)

  revalidatePath('/', 'layout')
}

export async function updateProde(prodeId: string, name: string, description: string) {
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

  const trimmedName = name.trim()
  if (!trimmedName) return { error: 'El nombre no puede estar vacío' }

  const { error } = await adminClient
    .from('prodes')
    .update({ name: trimmedName, description: description.trim() })
    .eq('id', prodeId)

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deleteProde(prodeId: string) {
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

  // Eliminar en orden por foreign keys
  await adminClient.from('picks').delete().eq('prode_id', prodeId)
  await adminClient.from('prode_members').delete().eq('prode_id', prodeId)
  await adminClient.from('prode_prizes').delete().eq('prode_id', prodeId)
  await adminClient.from('prodes').delete().eq('id', prodeId)

  revalidatePath('/', 'layout')
  return { success: true }
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
