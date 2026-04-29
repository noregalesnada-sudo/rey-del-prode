import DashboardShell from '@/components/layout/DashboardShell'
import { createClient } from '@/lib/supabase/server'
import { getDictionary, hasLocale } from '@/app/[lang]/dictionaries'
import { notFound } from 'next/navigation'

export default async function EmpresaAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  const [t, supabase] = await Promise.all([getDictionary(lang), createClient()])
  const { data: { user } } = await supabase.auth.getUser()

  let username = ''
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()
    username = profile?.username ?? user.email?.split('@')[0] ?? ''
  }

  return (
    <DashboardShell
      userName={username}
      userProdes={[]}
      isLoggedIn={!!user}
      lang={lang}
      tNav={t.nav}
      tTopbar={t.topbar}
      tLang={t.lang}
    >
      {children}
    </DashboardShell>
  )
}
