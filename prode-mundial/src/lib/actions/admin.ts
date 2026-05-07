'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SUPERADMIN_EMAIL = 'santiagodambrosio2@gmail.com'

async function getCompanyAdmin(companySlug: string): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return null
  if (user.email === SUPERADMIN_EMAIL) return user.email
  const { data } = await adminClient
    .from('company_admins')
    .select('id')
    .eq('company_slug', companySlug)
    .eq('email', user.email)
    .single()
  return data ? user.email : null
}

async function logAction(
  companySlug: string,
  adminEmail: string,
  action: string,
  targetUserId?: string | null,
  targetEmail?: string | null,
  metadata?: Record<string, unknown>
) {
  await adminClient.from('audit_logs').insert({
    company_slug: companySlug,
    admin_email: adminEmail,
    action,
    target_user_id: targetUserId ?? null,
    target_email: targetEmail ?? null,
    metadata: metadata ?? null,
  })
}

export async function updateAccessMode(
  companySlug: string,
  mode: 'whitelist' | 'invite_link'
) {
  const adminEmail = await getCompanyAdmin(companySlug)
  if (!adminEmail) return { error: 'Sin permisos' }

  const { error } = await adminClient
    .from('companies')
    .update({ access_mode: mode })
    .eq('slug', companySlug)
  if (error) return { error: error.message }

  await logAction(companySlug, adminEmail, 'access_mode_changed', null, null, { mode })
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function approveEnterpriseRequest(
  prodeId: string,
  userId: string,
  companySlug: string
) {
  const adminEmail = await getCompanyAdmin(companySlug)
  if (!adminEmail) return { error: 'Sin permisos' }

  await adminClient
    .from('prode_members')
    .update({ status: 'active' })
    .eq('prode_id', prodeId)
    .eq('user_id', userId)

  const { data: authUser } = await adminClient.auth.admin.getUserById(userId)
  await logAction(companySlug, adminEmail, 'member_approved', userId, authUser?.user?.email ?? null)
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function rejectEnterpriseRequest(
  prodeId: string,
  userId: string,
  companySlug: string
) {
  const adminEmail = await getCompanyAdmin(companySlug)
  if (!adminEmail) return { error: 'Sin permisos' }

  await adminClient
    .from('prode_members')
    .delete()
    .eq('prode_id', prodeId)
    .eq('user_id', userId)

  const { data: authUser } = await adminClient.auth.admin.getUserById(userId)
  await logAction(companySlug, adminEmail, 'member_rejected', userId, authUser?.user?.email ?? null)
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updateAreasEnabled(companySlug: string, enabled: boolean) {
  const adminEmail = await getCompanyAdmin(companySlug)
  if (!adminEmail) return { error: 'Sin permisos' }

  const { error } = await adminClient
    .from('companies')
    .update({ areas_enabled: enabled })
    .eq('slug', companySlug)
  if (error) return { error: error.message }

  await logAction(companySlug, adminEmail, 'areas_enabled_changed', null, null, { enabled })
  revalidatePath('/', 'layout')
}

export async function updateMemberRole(
  prodeId: string,
  userId: string,
  role: 'admin' | 'player',
  companySlug: string
) {
  const adminEmail = await getCompanyAdmin(companySlug)
  if (!adminEmail) return { error: 'Sin permisos' }

  const { data: authUser } = await adminClient.auth.admin.getUserById(userId)
  const targetEmail = authUser?.user?.email ?? null

  await adminClient
    .from('prode_members')
    .update({ role })
    .eq('prode_id', prodeId)
    .eq('user_id', userId)

  if (role === 'admin') {
    if (targetEmail) {
      await adminClient
        .from('company_admins')
        .upsert({ company_slug: companySlug, email: targetEmail }, { onConflict: 'company_slug,email' })
    }
  } else {
    if (targetEmail) {
      await adminClient
        .from('company_admins')
        .delete()
        .eq('company_slug', companySlug)
        .eq('email', targetEmail)
    }
  }

  await logAction(companySlug, adminEmail, 'role_changed', userId, targetEmail, { role })
  revalidatePath('/', 'layout')
}

export async function updateMemberArea(
  prodeId: string,
  userId: string,
  area: string,
  companySlug: string
) {
  const adminEmail = await getCompanyAdmin(companySlug)
  if (!adminEmail) return { error: 'Sin permisos' }

  await adminClient
    .from('prode_members')
    .update({ area: area || null })
    .eq('prode_id', prodeId)
    .eq('user_id', userId)

  await logAction(companySlug, adminEmail, 'area_updated', userId, null, { area: area || null })
}

export async function removeMemberFromProde(
  prodeId: string,
  userId: string,
  companySlug: string
) {
  const adminEmail = await getCompanyAdmin(companySlug)
  if (!adminEmail) return { error: 'Sin permisos' }

  const { data: authUser } = await adminClient.auth.admin.getUserById(userId)
  const targetEmail = authUser?.user?.email ?? null

  await adminClient
    .from('prode_members')
    .delete()
    .eq('prode_id', prodeId)
    .eq('user_id', userId)

  // Remover de la whitelist para que no pueda re-unirse
  if (targetEmail) {
    await adminClient
      .from('company_whitelist')
      .delete()
      .eq('company_slug', companySlug)
      .eq('email', targetEmail)
  }

  await logAction(companySlug, adminEmail, 'member_removed', userId, targetEmail)
}

export async function uploadCompanyAsset(
  formData: FormData,
  companySlug: string,
  type: 'logo' | 'banner'
) {
  const file = formData.get('file') as File
  if (!file || file.size === 0) return { error: 'No se seleccionó archivo' }
  if (file.size > 5 * 1024 * 1024) return { error: 'El archivo no puede superar 5MB' }
  if (!file.type.startsWith('image/')) return { error: 'Solo se permiten imágenes' }

  const ext = file.name.split('.').pop()
  const path = `companies/${companySlug}/${type}.${ext}`

  const { error: uploadError } = await adminClient.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = adminClient.storage.from('avatars').getPublicUrl(path)
  const url = `${publicUrl}?t=${Date.now()}`

  const field = type === 'logo' ? 'logo_url' : 'banner_url'
  const { error: updateError } = await adminClient
    .from('companies')
    .update({ [field]: url })
    .eq('slug', companySlug)

  if (updateError) return { error: updateError.message }

  revalidatePath('/', 'layout')
  return { success: true, url }
}

export async function importWhitelist(companySlug: string, csvText: string) {
  const adminEmail = await getCompanyAdmin(companySlug)
  if (!adminEmail) return { error: 'Sin permisos' }

  const lines = csvText.split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) return { error: 'CSV vacío o sin datos' }

  const header = lines[0].toLowerCase()
  if (!header.includes('email')) return { error: 'El CSV debe tener una columna "email"' }

  const cols = lines[0].split(',').map(c => c.trim().toLowerCase())
  const emailIdx = cols.indexOf('email')
  const areaIdx  = cols.indexOf('area')

  const rows = lines.slice(1).map(line => {
    const parts = line.split(',').map(p => p.trim())
    const email = parts[emailIdx]?.toLowerCase()
    const area  = areaIdx >= 0 ? parts[areaIdx] || null : null
    return { company_slug: companySlug, email, area }
  }).filter(r => r.email && r.email.includes('@'))

  if (rows.length === 0) return { error: 'No se encontraron emails válidos en el CSV' }

  const { error } = await adminClient
    .from('company_whitelist')
    .upsert(rows, { onConflict: 'company_slug,email', ignoreDuplicates: false })

  if (error) return { error: error.message }

  await logAction(companySlug, adminEmail, 'whitelist_imported', null, null, { count: rows.length })
  revalidatePath('/', 'layout')
  return { success: true, imported: rows.length }
}

export async function updateCompanyConfig(
  companySlug: string,
  data: { prodeName: string; primaryColor: string; secondaryColor: string; prodeDescription?: string }
) {
  const adminEmail = await getCompanyAdmin(companySlug)
  if (!adminEmail) return { error: 'Sin permisos' }

  const { data: company, error: fetchError } = await adminClient
    .from('companies')
    .select('prode_id')
    .eq('slug', companySlug)
    .single()

  if (fetchError || !company) return { error: 'Empresa no encontrada' }

  const { error } = await adminClient
    .from('companies')
    .update({
      prode_name: data.prodeName || null,
      primary_color: data.primaryColor || null,
      secondary_color: data.secondaryColor || null,
    })
    .eq('slug', companySlug)

  if (error) return { error: error.message }

  await adminClient
    .from('prodes')
    .update({ description: data.prodeDescription || null })
    .eq('id', company.prode_id)

  await logAction(companySlug, adminEmail, 'config_updated')
  revalidatePath('/', 'layout')
}

// Borrado de cuenta propio (self-service) — el usuario elimina su propia cuenta
export async function deleteOwnAccount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await adminClient.auth.admin.deleteUser(user.id)
  if (error) return { error: error.message }

  return { success: true }
}
