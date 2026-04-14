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
    to: 'agencia@posicionarte.online',
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
