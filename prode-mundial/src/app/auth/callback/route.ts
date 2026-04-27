import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as string | null
  const next = searchParams.get('next') ?? '/'

  const supabase = await createClient()

  const lang = searchParams.get('lang') ?? 'es'
  const localizedNext = next.startsWith('/es/') || next.startsWith('/en/') ? next : `/${lang}${next}`

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'recovery' | 'signup' | 'email' | 'invite' | 'magiclink',
    })
    if (!error) {
      return NextResponse.redirect(`${origin}${localizedNext}`)
    }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${localizedNext}`)
    }
  }

  return NextResponse.redirect(`${origin}/${lang}/login?error=link_expirado`)
}
