import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminGuard } from '@/components/auth/AdminGuard'

/**
 * Admin Dashboard Layout
 * Provides consistent layout with sidebar navigation for all admin pages
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Sidebar */}
          <AdminSidebar />

          {/* Main Content */}
          <main className="flex-1 ml-64">
            <div className="p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminGuard>
  )
}
