'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUser } from '@/contexts/userContext'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  CheckSquare,
  FileText,
  Sparkles,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/constants'
import { createClient } from '@/lib/supabase/client'

const icons = {
  LayoutDashboard,
  Users,
  FolderOpen,
  CheckSquare,
  FileText,
  Sparkles,
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useUser()
const workspaceName = user?.workspace?.name ?? ''
const logoUrl = user?.workspace?.logo_url ?? ''


  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navLinks = (
    <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const Icon = icons[item.icon as keyof typeof icons]
        const isActive =
          pathname === item.href ||
          pathname.startsWith(item.href + '/')

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 h-10 rounded-lg text-sm transition-colors',
              isActive
                ? 'bg-green-50 text-green-800 font-medium'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            )}
          >
            <Icon size={16} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )

  const bottomLinks = (
    <div className="px-3 py-4 border-t border-neutral-200 flex flex-col gap-1">
      <Link
        href="/settings"
        onClick={() => setMobileOpen(false)}
        className={cn(
          'flex items-center gap-3 px-3 h-10 rounded-lg text-sm transition-colors',
          pathname === '/settings'
            ? 'bg-green-50 text-green-800 font-medium'
            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
        )}
      >
        <Settings size={16} />
        Settings
      </Link>
      <button
        onClick={handleSignOut}
        className="flex items-center gap-3 px-3 h-10 rounded-lg text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors w-full text-left"
      >
        <LogOut size={16} />
        Sign out
      </button>
    </div>
  )

  const logo = (showClose: boolean) => (
    <div className="h-14 flex items-center px-4 border-b border-neutral-200 justify-between">
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Logo image or fallback */}
        <div className="w-7 h-7 rounded-lg bg-green-700 flex items-center justify-center overflow-hidden flex-shrink-0">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white text-xs font-bold">
              {workspaceName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <span className="text-sm font-semibold text-neutral-900 tracking-tight truncate">
          {workspaceName}
        </span>
      </div>
      {showClose && (
        <button
          className="lg:hidden text-neutral-500 flex-shrink-0"
          onClick={() => setMobileOpen(false)}
        >
          <X size={18} />
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-60 border-r border-neutral-200 bg-neutral-50 flex-col z-40">
        {logo(false)}
        {navLinks}
        {bottomLinks}
      </aside>

      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-neutral-200 text-neutral-600 shadow-sm"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={18} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed left-0 top-0 h-screen w-60 border-r border-neutral-200 bg-neutral-50 flex flex-col z-50 transition-transform duration-200',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {logo(true)}
        {navLinks}
        {bottomLinks}
      </aside>
    </>
  )
}