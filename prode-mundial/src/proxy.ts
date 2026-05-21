import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Auth: 10 intentos por minuto por IP (anti brute-force)
const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  prefix: 'rl:auth',
})

// API críticas: 30 requests por minuto por IP
const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '1 m'),
  prefix: 'rl:api',
})

function getIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1'
  )
}

async function applyRateLimit(
  limiter: Ratelimit,
  key: string
): Promise<NextResponse | null> {
  const { success } = await limiter.limit(key)
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }
  return null
}

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

  const ip = getIp(request)

  // Rate limit rutas de auth (anti brute-force)
  if (
    pathname.includes('/login') ||
    pathname.includes('/register') ||
    pathname.includes('/forgot-password') ||
    pathname.includes('/reset-password')
  ) {
    const limited = await applyRateLimit(authLimiter, `${ip}:${pathname}`)
    if (limited) return limited
  }

  // Rate limit API routes críticas
  if (pathname.startsWith('/api/')) {
    const limited = await applyRateLimit(apiLimiter, `${ip}:api`)
    if (limited) return limited
  }

  // Admin routes — bypass i18n, apply session guard only
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    let adminResponse = NextResponse.next({ request })
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            adminResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              adminResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )
    const { data: { user } } = await supabaseAdmin.auth.getUser()
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/es/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
    return adminResponse
  }

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

  // Enterprise company pages (/{slug} and /{slug}/register) are public —
  // any first-level segment that isn't a known app route is treated as a company slug
  const KNOWN_SEGMENTS = new Set([
    'login', 'register', 'forgot-password', 'reset-password', 'auth',
    'mis-pronos', 'perfil', 'crear-prode', 'prode', 'unirse',
    'fase', 'precios', 'privacidad', 'terminos', 'contacto',
    'prode-mundial', 'empresa-admin', 'api',
  ])
  const firstSegment = pathWithoutLocale.split('/')[1] ?? ''
  const isEnterpriseRoute = firstSegment !== '' && !KNOWN_SEGMENTS.has(firstSegment)

  // Unauthenticated → redirect to locale-prefixed login
  if (!user && !isAuthRoute && !isPublicRoute && !isEnterpriseRoute) {
    const url = request.nextUrl.clone()
    url.searchParams.set('next', pathWithoutLocale)
    url.pathname = `/${locale}/login`
    return NextResponse.redirect(url)
  }

  // Already authenticated → redirect away from auth pages
  // Exception: reset-password requires an active session (recovery flow)
  if (user && isAuthRoute && !pathWithoutLocale.startsWith('/reset-password')) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}`
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
