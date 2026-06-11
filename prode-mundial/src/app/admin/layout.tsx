import './admin.css'
import AdminSidebar from '@/components/admin-layout/AdminSidebar'
import AdminHeader from '@/components/admin-layout/AdminHeader'
import { SidebarProvider } from '@/components/admin-layout/SidebarProvider'
import { getAdminUser } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Backoffice — Rey del Prode' }

// Backoffice = datos en vivo: nunca prerenderizar en build (las queries pesadas de
// ranking/usuarios/etc. tardaban +60s con la DB cargada y volteaban el build).
// force-dynamic en el layout aplica a todas las /admin/*.
export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser()
  if (!admin) redirect('/')

  return (
    <SidebarProvider>
      <div className="admin-root">
        <AdminSidebar />
        <div className="admin-main">
          <AdminHeader />
          <main className="admin-content">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
