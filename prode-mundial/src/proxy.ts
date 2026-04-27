import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const LOCALES = ['es', 'en'] as const
type Locale = (typeof LOCALES)[number]
const DEFAULT_LOCALE: Locale = 'es'

function getLocale(request: NextRequest): Locale {
  const acceptLang = request.headers.get('accept-language') ?? ''
  if (acceptLang.toLowerCase().startsWith('en')) return 'en'
  return DEFAULT_LOCALE
}

function stripLocale(pathname: string): string {
  for (const locale of LOCALES) {
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1)
    if (pathname === `/${locale}`) return '/'
  }
  return pathname
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Static files and API routes pass through immediately
  const isApiRoute = pathname.startsWith('/api/')
  if (isApiRoute) return NextResponse.next({ request })

  // Detect if the URL already has a supported locale prefix
  const hasLocalePrefix = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // No locale in URL → redirect to detected locale
  if (!hasLocalePrefix) {
    const locale = getLocale(request)
    const url = request.nextUrl.clone()
    url.pathname = pathname === '/' ? `/${locale}` : `/${locale}${pathname}`
    return NextResponse.redirect(url)
  }

  // Extract locale and path-without-locale for auth logic
  const locale = LOCALES.find(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
  ) ?? DEFAULT_LOCALE
  const pathWithoutLocale = stripLocale(pathname)

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isAuthRoute =
    pathWithoutLocale.startsWith('/login') ||
    pathWithoutLocale.startsWith('/register') ||
    pathWithoutLocale.startsWith('/forgot-password') ||
    pathWithoutLocale.startsWith('/reset-password') ||
    pathWithoutLocale.startsWith('/auth/')

  const isPublicRoute =
    pathWithoutLocale === '/' ||
    pathWithoutLocale.startsWith('/fase/') ||
    pathWithoutLocale === '/precios' ||
    pathWithoutLocale === '/privacidad' ||
    pathWithoutLocale === '/terminos' ||
    pathWithoutLocale === '/contacto' ||
    pathWithoutLocale === '/prode-mundial'

  // Unauthenticated → redirect to locale-prefixed login
  if (!user && !isAuthRoute && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.searchParams.set('next', pathWithoutLocale)
    url.pathname = `/${locale}/login`
    return NextResponse.redirect(url)
  }

  // Already authenticated → redirect away from auth pages
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}`
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
