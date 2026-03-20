'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Camera } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/userContext'
export default function SettingsClient() {
  const router = useRouter()
  const supabase = createClient()
  const { refresh } = useUser()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const [fullName, setFullName] = useState('')
  const [workspaceName, setWorkspaceName] = useState('')
  const [workspaceId, setWorkspaceId] = useState('')
  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [logoUrl, setLogoUrl] = useState('')

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const { data: authData } = await supabase.auth.getUser()
      if (!authData.user) return

      setEmail(authData.user.email ?? '')

      const { data: userData } = await supabase
        .from('users')
        .select('*, workspace:workspaces(*)')
        .eq('id', authData.user.id)
        .single()

      if (userData) {
        setFullName(userData.full_name ?? '')
        setUserId(userData.id)
        setWorkspaceId(userData.workspace_id)
        setAvatarUrl(userData.avatar_url ?? '')
        setWorkspaceName((userData.workspace as { name: string; logo_url?: string })?.name ?? '')
        setLogoUrl((userData.workspace as { name: string; logo_url?: string })?.logo_url ?? '')
      }

      setLoading(false)
    }

    load()
  }, [])

async function uploadImage(file: File, bucket: string, path: string): Promise<string | null> {
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
  if (error) { console.error(error); return null }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return `${data.publicUrl}?t=${Date.now()}`
}

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadImage(file, 'avatars', `avatars/${userId}`)
    if (url) {
      setAvatarUrl(url)
      await supabase.from('users').update({ avatar_url: url }).eq('id', userId)
    }
    if (url) {
  setAvatarUrl(url)
  await supabase.from('users').update({ avatar_url: url }).eq('id', userId)
  refresh() // add this
}
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadImage(file, 'avatars', `logos/${workspaceId}`)
    if (url) {
      setLogoUrl(url)
      await supabase.from('workspaces').update({ logo_url: url }).eq('id', workspaceId)
    }
    if (url) {
  setLogoUrl(url)
  await supabase.from('workspaces').update({ logo_url: url }).eq('id', workspaceId)
  refresh() // add this
}
  }

  async function handleSave() {
    setSaving(true)
    setSuccess(false)

    await supabase.from('users').update({ full_name: fullName }).eq('id', userId)
    await supabase.from('workspaces').update({ name: workspaceName }).eq('id', workspaceId)
    refresh()
    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function getInitials(name: string) {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-6 h-6 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">

      <h2 className="text-xl font-semibold text-neutral-900 mb-8">Settings</h2>

      {/* Profile section */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-5">
        <h3 className="text-sm font-medium text-neutral-900 mb-1">Profile</h3>
        <p className="text-xs text-neutral-400 mb-5">Your personal information</p>

        {/* Avatar upload */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-medium text-neutral-600">
                  {getInitials(fullName || 'U')}
                </span>
              )}
            </div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-700 rounded-full flex items-center justify-center hover:bg-green-800 transition-colors"
            >
              <Camera size={12} className="text-white" />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900">{fullName || 'Your name'}</p>
            <p className="text-xs text-neutral-400">{email}</p>
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="text-xs text-green-700 hover:underline mt-1"
            >
              Change photo
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="h-10 px-3 rounded-lg border border-neutral-200 text-sm bg-neutral-50 text-neutral-400 cursor-not-allowed"
            />
            <p className="text-xs text-neutral-400">Email cannot be changed</p>
          </div>
        </div>
      </div>

      {/* Workspace section */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-5">
        <h3 className="text-sm font-medium text-neutral-900 mb-1">Workspace</h3>
        <p className="text-xs text-neutral-400 mb-5">Your workspace settings</p>

        {/* Logo upload */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-xl bg-neutral-100 flex items-center justify-center overflow-hidden border border-neutral-200">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-medium text-neutral-500">
                  {getInitials(workspaceName || 'W')}
                </span>
              )}
            </div>
            <button
              onClick={() => logoInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-700 rounded-full flex items-center justify-center hover:bg-green-800 transition-colors"
            >
              <Camera size={12} className="text-white" />
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900">{workspaceName || 'Workspace'}</p>
            <button
              onClick={() => logoInputRef.current?.click()}
              className="text-xs text-green-700 hover:underline mt-1"
            >
              Change logo
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700">Workspace name</label>
          <input
            type="text"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
          />
        </div>
      </div>

      {/* Save button */}
      <div className="flex items-center justify-between mb-8">
        {success && (
          <p className="text-sm text-green-700 font-medium">Changes saved successfully</p>
        )}
        {!success && <div />}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 h-9 px-5 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>

      {/* Danger zone */}
      <div className="bg-white border border-red-200 rounded-xl p-6">
        <h3 className="text-sm font-medium text-red-700 mb-1">Danger zone</h3>
        <p className="text-xs text-neutral-400 mb-5">Irreversible actions</p>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-900">Sign out</p>
            <p className="text-xs text-neutral-400">Sign out of your account</p>
          </div>
          <button
            onClick={handleSignOut}
            className="h-9 px-4 border border-neutral-200 text-sm text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

    </div>
  )
}