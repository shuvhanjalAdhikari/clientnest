'use client'
import { useUser } from '@/contexts/userContext'
import { useWorkspace } from '@/hooks/workspace'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { Users, FolderOpen, CheckSquare, AlertCircle, Plus } from 'lucide-react'
import Link from 'next/link'

export default function DashboardClient() {
  const { user, loading: workspaceLoading } = useUser()
const workspace = user?.workspace
  const { stats, loading: statsLoading } = useDashboardStats()

  const loading = workspaceLoading || statsLoading

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const statCards = [
    {
      label: 'Total clients',
      value: stats.totalClients,
      icon: Users,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      border: 'border-neutral-200',
      href: '/clients',
    },
    {
      label: 'Active projects',
      value: stats.activeProjects,
      icon: FolderOpen,
      color: 'text-green-700',
      bg: 'bg-green-50',
      border: 'border-neutral-200',
      href: '/projects',
    },
    {
      label: 'Open tasks',
      value: stats.openTasks,
      icon: CheckSquare,
      color: 'text-purple-700',
      bg: 'bg-purple-50',
      border: 'border-neutral-200',
      href: '/tasks',
    },
    {
      label: 'Overdue tasks',
      value: stats.overdueTasks,
      icon: AlertCircle,
      color: 'text-red-700',
      bg: 'bg-red-50',
      border: stats.overdueTasks > 0 ? 'border-red-300' : 'border-neutral-200',
      href: '/tasks',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-6 h-6 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">

      {/* Greeting */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-neutral-900">
          {greeting()}, {user?.full_name?.split(' ')[0] ?? 'there'}
        </h2>
        <p className="text-neutral-500 text-sm mt-1">
          {workspace?.name} · Here&apos;s what&apos;s happening today
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.label}
              href={card.href}
              className={`bg-white border ${card.border} rounded-xl p-5 hover:shadow-sm transition-shadow`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-neutral-500">{card.label}</span>
                <div className={`w-8 h-8 ${card.bg} rounded-lg flex items-center justify-center`}>
                  <Icon size={16} className={card.color} />
                </div>
              </div>
              <div className="text-3xl font-semibold text-neutral-900 font-mono">
                {card.value}
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">
          Quick actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/clients"
            className="flex items-center gap-2 h-9 px-4 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={16} />
            New client
          </Link>
          <Link
            href="/projects"
            className="flex items-center gap-2 h-9 px-4 bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-700 text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={16} />
            New project
          </Link>
          <Link
            href="/documents"
            className="flex items-center gap-2 h-9 px-4 bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-700 text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={16} />
            Upload document
          </Link>
        </div>
      </div>

      {/* Empty state if no data */}
      {stats.totalClients === 0 && (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
          <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Users size={24} className="text-neutral-400" />
          </div>
          <h3 className="text-base font-medium text-neutral-900 mb-1">
            Add your first client
          </h3>
          <p className="text-neutral-500 text-sm mb-4">
            Start by adding a client to track their projects and tasks
          </p>
          <Link
            href="/clients"
            className="inline-flex items-center gap-2 h-9 px-4 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={16} />
            Add client
          </Link>
        </div>
      )}

    </div>
  )
}