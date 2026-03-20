'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      router.push('/dashboard')
    }
  }
  checkUser()
}, [])

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company_name: companyName,
        }
      }
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      router.push('/onboarding')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* Left panel — hidden on mobile, visible on desktop */}
      <div className="hidden lg:flex lg:w-[55%] bg-neutral-900 flex-col justify-between p-12 relative overflow-hidden">
        
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
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
            Your workspace.<br />
            Your clients.<br />
            <span className="text-green-400">Your way.</span>
          </h2>
          <div className="flex flex-col gap-4">
            {[
              'Set up your workspace in under 2 minutes',
              'Invite your team and start collaborating',
              'Free to get started — no credit card needed',
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

      {/* Right panel — full width on mobile */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 sm:px-8 bg-neutral-50">

        {/* Mobile logo — only shows on mobile */}
        <div className="lg:hidden mb-8 self-start">
          <span className="text-neutral-900 text-xl font-semibold tracking-tight">
            Client<span className="text-green-700">Nest</span>
          </span>
        </div>

        <div className="w-full max-w-sm">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-neutral-900 mb-1">
              Create your workspace
            </h1>
            <p className="text-neutral-500 text-sm">
              Get started in under 2 minutes
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="flex flex-col gap-4">

            {/* Full name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-700">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Smith"
                required
                className="h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
              />
            </div>

            {/* Company name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-700">
                Company name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Inc."
                required
                className="h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-700">
                Work email
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
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
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
              {loading ? 'Creating workspace...' : 'Get started free'}
            </button>

            {/* Terms */}
            <p className="text-center text-xs text-neutral-400">
              By continuing you agree to our Terms of Service
            </p>

          </form>

          {/* Login link */}
          <p className="text-center text-sm text-neutral-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-green-700 font-medium hover:underline">
              Sign in
            </Link>
          </p>

        </div>
      </div>

    </div>
  )
}