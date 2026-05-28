import './admin.css'
import AdminSidebar from '@/components/admin-layout/AdminSidebar'
import AdminHeader from '@/components/admin-layout/AdminHeader'
import { getAdminUser } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Backoffice — Rey del Prode' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser()
  if (!admin) redirect('/')

  return (
    <div className="admin-root">
      <AdminSidebar />
      <div className="admin-main">
        <AdminHeader />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  )
}
