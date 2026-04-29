'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function registerEnterprise(
  formData: FormData
): Promise<{ error?: string; pending?: boolean } | void> {
  const companySlug = formData.get('company_slug') as string
  const email       = (formData.get('email') as string).toLowerCase().trim()
  const password    = formData.get('password') as string
  const username    = (formData.get('username') as string).trim()
  const first_name  = (formData.get('first_name') as string).trim()
  const last_name   = (formData.get('last_name') as string).trim()

  // 1. Obtener la empresa y su modo de acceso
  const { data: company } = await adminClient
    .from('companies')
    .select('prode_id, access_mode')
    .eq('slug', companySlug)
    .single()

  if (!company?.prode_id) return { error: 'Error de configuración. Contactá al administrador.' }

  const accessMode: string = (company as any).access_mode ?? 'whitelist'
  const usesWhitelist = accessMode === 'whitelist' || accessMode === 'both'
  const usesInviteLink = accessMode === 'invite_link' || accessMode === 'both'

  let whitelistEntry: { id: string; area: string | null } | null = null

  if (usesWhitelist) {
    const { data: entry } = await adminClient
      .from('company_whitelist')
      .select('id, area, used')
      .eq('company_slug', companySlug)
      .eq('email', email)
      .single()

    if (accessMode === 'whitelist') {
      // Solo whitelist: rechazar si no está o ya fue usado
      if (!entry) return { error: 'Este mail no está autorizado. Contactá al administrador.' }
      if ((entry as any).used) return { error: 'Este mail ya fue utilizado para registrarse.' }
    }

    if (entry && !(entry as any).used) {
      whitelistEntry = entry as { id: string; area: string | null }
    }
  }

  // 2. En modo invite_link puro, la membresía arranca como pending si no está en whitelist
  const memberStatus = whitelistEntry ? 'active' : (usesInviteLink ? 'pending' : 'active')

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

  // 5. Unir al prode
  await adminClient.from('prode_members').insert({
    prode_id: company.prode_id,
    user_id: userId,
    role: 'player',
    status: memberStatus,
    area: whitelistEntry?.area ?? null,
  })

  // 6. Marcar whitelist como usada si aplica
  if (whitelistEntry) {
    await adminClient
      .from('company_whitelist')
      .update({ used: true })
      .eq('id', whitelistEntry.id)
  }

  revalidatePath('/', 'layout')

  if (memberStatus === 'pending') {
    return { pending: true }
  }

  redirect(`/prode/${prode?.slug}`)
}

export async function requestToJoinEnterprise(formData: FormData) {
  const companySlug = formData.get('company_slug') as string
  const prodeId     = formData.get('prode_id') as string
  const lang        = formData.get('lang') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${lang}/${companySlug}`)

  // Verificar que no tenga ya membresía
  const { data: existing } = await adminClient
    .from('prode_members')
    .select('status')
    .eq('prode_id', prodeId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!existing) {
    await adminClient.from('prode_members').insert({
      prode_id: prodeId,
      user_id: user.id,
      role: 'player',
      status: 'pending',
    })
    revalidatePath('/', 'layout')
  }

  redirect(`/${lang}/${companySlug}`)
}

export async function submitEnterpriseContact(
  formData: FormData
): Promise<{ error?: string } | void> {
  const nombre    = (formData.get('nombre')    as string | null)?.trim() ?? ''
  const email     = (formData.get('email')     as string | null)?.trim() ?? ''
  const telefono  = (formData.get('telefono')  as string | null)?.trim() ?? ''
  const empresa   = (formData.get('empresa')   as string | null)?.trim() ?? ''
  const empleados = (formData.get('empleados') as string | null)?.trim() ?? ''

  if (!nombre || !email || !empresa || !empleados) {
    return { error: 'Por favor completá todos los campos requeridos.' }
  }

  const { error } = await adminClient
    .from('enterprise_contacts')
    .insert({ nombre, email, telefono, empresa, empleados })

  if (error) return { error: 'Hubo un error al enviar. Intentá de nuevo.' }

  // Notificación interna por mail
  await resend.emails.send({
    from: 'Rey del Prode <noreply@reydelprode.com>',
    to: 'contacto@reydelprode.com',
    replyTo: email,
    subject: `Nuevo lead Enterprise — ${empresa}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; color: #333;">
        <h2 style="color: #0a1f3d;">Nuevo lead Enterprise — Rey del Prode</h2>
        <table style="width:100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; font-weight: bold; width: 140px;">Nombre</td><td>${nombre}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Teléfono</td><td>${telefono || '—'}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Empresa</td><td>${empresa}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Empleados</td><td>${empleados}</td></tr>
        </table>
      </div>
    `,
  })
}
