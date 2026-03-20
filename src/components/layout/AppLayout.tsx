import Sidebar from './Sidebar'
import Topbar from './Topbar'

interface AppLayoutProps {
  children: React.ReactNode
  title: string
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-50">

      {/* Sidebar */}
      <Sidebar />

      {/* Main area — offset by sidebar on desktop */}
      <div className="lg:ml-60">

        {/* Topbar */}
        <Topbar title={title} />

        {/* Page content */}
        <main className="pt-14 min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>

      </div>

    </div>
  )
}