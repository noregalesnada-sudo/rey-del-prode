'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { Resend } from 'resend'

function mapAuthError(error: { message: string; code?: string }): string {
  const code = error.code ?? ''
  const m = error.message.toLowerCase()

  // 1) Preferir el código de error de Supabase (más estable que el texto)
  switch (code) {
    case 'weak_password':              return 'Esa contraseña es muy insegura (aparece en filtraciones conocidas). Probá con una distinta.'
    case 'user_already_exists':
    case 'email_exists':               return 'Ya existe una cuenta con ese email.'
    case 'invalid_credentials':        return 'Email o contraseña incorrectos.'
    case 'email_not_confirmed':        return 'Confirmá tu email antes de ingresar. Revisá tu bandeja de entrada (y la carpeta de spam).'
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':    return 'Demasiados intentos. Esperá unos minutos e intentá de nuevo.'
    case 'email_address_invalid':      return 'El email no tiene un formato válido.'
    case 'signup_disabled':            return 'El registro está temporalmente deshabilitado.'
    case 'email_provider_disabled':    return 'El registro con email está deshabilitado.'
  }

  // 2) Fallback por texto (versiones viejas o errores sin código)
  if (m.includes('database error saving new user'))    return 'No se pudo crear la cuenta. Probá con otro nombre de usuario o contactanos si el problema persiste.'
  if (m.includes('already registered') || m.includes('already been registered')) return 'Ya existe una cuenta con ese email.'
  if (m.includes('invalid login credentials'))         return 'Email o contraseña incorrectos.'
  if (m.includes('email not confirmed'))               return 'Confirmá tu email antes de ingresar. Revisá tu bandeja de entrada (y la carpeta de spam).'
  if (m.includes('password') && (m.includes('weak') || m.includes('pwned') || m.includes('breach') || m.includes('easy to guess') || m.includes('compromised')))
    return 'Esa contraseña es muy insegura (aparece en filtraciones conocidas). Probá con una distinta.'
  if (m.includes('password should be at least') || m.includes('at least 8')) return 'La contraseña debe tener al menos 8 caracteres.'
  if (m.includes('unable to validate email') || m.includes('invalid email')) return 'El email no tiene un formato válido.'
  if (m.includes('email rate limit') || m.includes('too many requests') || m.includes('rate limit')) return 'Demasiados intentos. Esperá unos minutos e intentá de nuevo.'
  if (m.includes('error sending') || m.includes('confirmation email') || m.includes('confirmation mail') || m.includes('smtp'))
    return 'No pudimos enviar el email de confirmación. Esperá unos minutos e intentá de nuevo, o escribinos.'
  if (m.includes('signup') && m.includes('disabled'))  return 'El registro está temporalmente deshabilitado.'
  return 'Ocurrió un error inesperado. Intentá de nuevo.'
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: mapAuthError(error) }

  revalidatePath('/', 'layout')
  const next = (formData.get('next') as string | null)?.trim()
  redirect(next && next.startsWith('/') ? next : '/es/mis-pronos')
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

  if (error) {
    console.error('[register] signUp error:', { status: error.status, code: error.code, message: error.message })
    return { error: mapAuthError(error) }
  }

  if (data.user && (first_name || last_name)) {
    await supabase
      .from('profiles')
      .update({ first_name, last_name })
      .eq('id', data.user.id)
  }

  // Enviar email de bienvenida (no bloqueante)
  const resend = new Resend(process.env.RESEND_API_KEY)
  const displayName = first_name ? `${first_name}${last_name ? ' ' + last_name : ''}` : username
  resend.emails.send({
    from: 'Rey del Prode <noreply@reydelprode.com>',
    to: email,
    subject: '¡Bienvenido al Rey del Prode!',
    html: welcomeEmail(displayName),
  }).catch(() => {})

  if (data.session) {
    revalidatePath('/', 'layout')
    redirect('/es/mis-pronos')
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

// URL canónica de la app. En prod debe estar seteada NEXT_PUBLIC_APP_URL
// (ej: https://reydelprode.com). Si no, se cae al host del request.
async function getBaseUrl(): Promise<string> {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
  if (envUrl && /^https?:\/\//.test(envUrl)) return envUrl

  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? (host?.includes('localhost') ? 'http' : 'https')
  return host ? `${proto}://${host}` : 'http://localhost:3000'
}

export async function forgotPassword(formData: FormData) {
  const email = (formData.get('email') as string | null)?.trim().toLowerCase()
  const lang = (formData.get('lang') as string) || 'es'

  // No revelamos si el email existe o no (evita enumeración de usuarios):
  // ante cualquier problema devolvemos success igual.
  if (!email) return { success: true }

  // Generamos el link de recovery nosotros mismos (flujo token_hash, sin PKCE).
  // Esto evita depender de la cookie code_verifier, así funciona en cualquier
  // dispositivo/navegador y tolera www / no-www.
  const admin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email,
  })

  // Usuario inexistente u otro error: no filtramos info, success igual.
  if (error || !data?.properties?.hashed_token) {
    if (error) console.error('[forgotPassword] generateLink error:', error.message)
    return { success: true }
  }

  const baseUrl = await getBaseUrl()
  // Apuntamos directo a la página de reset (NO al callback): así el token de
  // un solo uso NO se verifica en el GET del link. Los escáneres de correo
  // (Outlook/Hotmail "Safe Links", antivirus) pre-cargan los enlaces con un GET
  // automático y quemarían el token antes de que el usuario haga clic. El token
  // se verifica recién al enviar el form (POST) en resetPassword().
  const link = `${baseUrl}/${lang}/reset-password?token_hash=${data.properties.hashed_token}&type=recovery`

  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    await resend.emails.send({
      from: 'Rey del Prode <noreply@reydelprode.com>',
      to: email,
      subject: 'Restablecé tu contraseña — Rey del Prode',
      html: resetPasswordEmail(link),
    })
  } catch (e) {
    console.error('[forgotPassword] resend error:', e)
    return { error: 'No pudimos enviar el email. Esperá unos minutos e intentá de nuevo.' }
  }

  return { success: true }
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const token_hash = (formData.get('token_hash') as string | null)?.trim()

  // Verificamos el token de recovery acá (al enviar), no en el GET del link.
  // Esto vuelve el flujo inmune al pre-fetch de los escáneres de correo, que
  // no ejecutan este POST. Si no viene token_hash, asumimos que ya hay sesión
  // de recovery activa (compat. con el flujo anterior).
  if (token_hash) {
    const { error: otpError } = await supabase.auth.verifyOtp({ token_hash, type: 'recovery' })
    if (otpError) return { error: 'El enlace expiró o ya fue usado. Pedí uno nuevo desde "Olvidé mi contraseña".' }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { error: mapAuthError(error) }

  revalidatePath('/', 'layout')
  redirect('/es/mis-pronos')
}

function resetPasswordEmail(link: string): string {
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
            <h2 style="color:#e6edf3;font-size:18px;margin:0 0 12px;">Restablecé tu contraseña</h2>
            <p style="color:#8b949e;font-size:15px;line-height:1.6;margin:0 0 20px;">
              Recibimos un pedido para restablecer la contraseña de tu cuenta. Hacé clic en el botón para elegir una nueva. El enlace es de un solo uso y vence en 1 hora.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center" style="padding:8px 0;">
                <a href="${link}" style="display:inline-block;background:#003087;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:4px;font-weight:700;font-size:14px;letter-spacing:0.5px;text-transform:uppercase;">
                  Cambiar contraseña
                </a>
              </td></tr>
            </table>
            <p style="color:#8b949e;font-size:12px;line-height:1.5;margin:20px 0 0;">
              Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br />
              <a href="${link}" style="color:#74c0fc;word-break:break-all;">${link}</a>
            </p>
            <p style="color:#484f58;font-size:12px;margin:24px 0 0;text-align:center;">
              Si no pediste esto, ignorá este email. Tu contraseña no cambiará.
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
