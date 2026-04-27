'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

  if (data.user && (first_name || last_name)) {
    await supabase
      .from('profiles')
      .update({ first_name, last_name })
      .eq('id', data.user.id)
  }

  // Enviar email de bienvenida (no bloqueante)
  const displayName = first_name ? `${first_name}${last_name ? ' ' + last_name : ''}` : username
  resend.emails.send({
    from: 'Rey del Prode <noreply@reydelprode.com>',
    to: email,
    subject: '¡Bienvenido al Rey del Prode!',
    html: welcomeEmail(displayName),
  }).catch(() => {})

  if (data.session) {
    revalidatePath('/', 'layout')
    redirect('/')
  }

  return { success: true, needsConfirmation: true }
}

export async function logout(formData: FormData) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  const lang = (formData.get('lang') as string) || 'es'
  redirect(`/${lang}/login`)
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const lang = (formData.get('lang') as string) || 'es'

  const headersList = await headers()
  const origin = headersList.get('origin') ?? headersList.get('x-forwarded-host')
    ? `https://${headersList.get('x-forwarded-host')}`
    : 'http://localhost:3000'

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/${lang}/auth/reset-password`,
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  redirect('/')
}

function welcomeEmail(name: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0d1117;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1117;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:500px;background:#161b22;border-radius:8px;border:1px solid #30363d;overflow:hidden;">
        <tr>
          <td style="background:#003087;padding:32px;text-align:center;">
            <img src="https://reydelprode.com/escudo.png" alt="Rey del Prode" style="width:120px;display:block;margin:0 auto 12px;" />
            <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">Rey del Prode</h1>
            <p style="color:#74c0fc;margin:6px 0 0;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Mundial 2026</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 28px;">
            <h2 style="color:#e6edf3;font-size:18px;margin:0 0 12px;">¡Hola, ${name}!</h2>
            <p style="color:#8b949e;font-size:15px;line-height:1.6;margin:0 0 20px;">
              Ya sos parte del Rey del Prode. Podés empezar a hacer tus pronósticos para el Mundial 2026 y competir con tus amigos.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center" style="padding:8px 0;">
                <a href="https://reydelprode.com" style="display:inline-block;background:#003087;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:4px;font-weight:700;font-size:14px;letter-spacing:0.5px;text-transform:uppercase;">
                  Ir al prode
                </a>
              </td></tr>
            </table>
            <p style="color:#484f58;font-size:12px;margin:24px 0 0;text-align:center;">
              Si no creaste esta cuenta, ignorá este email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 28px;border-top:1px solid #30363d;text-align:center;">
            <p style="color:#484f58;font-size:12px;margin:0;">
              © 2026 Rey del Prode · <a href="https://reydelprode.com" style="color:#484f58;">reydelprode.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
