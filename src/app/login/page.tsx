'use client'

import { useState,useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { redirect } from 'next/navigation'

export default function LoginPage() {

  const router = useRouter()
  const supabase = createClient()


  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

// Add inside component after state declarations:
useEffect(() => {
  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      router.push('/dashboard')
    }
  }
  checkUser()
}, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[55%] bg-neutral-900 ... flex-col justify-between p-12 relative overflow-hidden">
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <span className="text-white text-xl font-semibold tracking-tight">
            Client<span className="text-green-400">Nest</span>
          </span>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <h2 className="text-white text-4xl font-light leading-tight mb-8">
            Manage clients.<br />
            Track projects.<br />
            <span className="text-green-400">Stay in control.</span>
          </h2>
          <div className="flex flex-col gap-4">
            {[
              'All your clients and projects in one place',
              'AI-powered document search and insights',
              'Auto-generated status reports in one click',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                <p className="text-neutral-400 text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-neutral-600 text-xs">
            © 2025 ClientNest. Built for small businesses.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 sm:px-8 bg-neutral-50">
        <div className="lg:hidden mb-8 self-start">
  <span className="text-neutral-900 text-xl font-semibold tracking-tight">
    Client<span className="text-green-700">Nest</span>
  </span>
</div>

        <div className="w-full max-w-sm">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-neutral-900 mb-1">
              Welcome back
            </h1>
            <p className="text-neutral-500 text-sm">
              Sign in to your workspace
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-10 px-3 pr-10 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="h-10 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

          </form>

          {/* Register link */}
          <p className="text-center text-sm text-neutral-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-green-700 font-medium hover:underline">
              Create one
            </Link>
          </p>

        </div>
      </div>

    </div>
  )
}