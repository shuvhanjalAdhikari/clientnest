'use client'

import { Bell } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useUser } from '@/contexts/userContext'
interface TopbarProps {
  title: string
}

export default function Topbar({ title }: TopbarProps) {
  const { user } = useUser()

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <header className="fixed top-0 left-0 lg:left-60 right-0 h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-4 sm:px-8 z-30">

      <h1 className="text-base font-medium text-neutral-900 ml-10 lg:ml-0">
        {title}
      </h1>

      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-green-600 rounded-full" />
        </button>

        <Avatar className="w-8 h-8 cursor-pointer">
          {user?.avatar_url ? (
            <AvatarImage src={user.avatar_url} alt="Avatar" />
          ) : null}
          <AvatarFallback className="bg-neutral-200 text-neutral-700 text-xs font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}