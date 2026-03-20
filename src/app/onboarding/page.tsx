'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Building2, Users, CheckCircle } from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Workspace' },
  { id: 2, label: 'Your details' },
  { id: 3, label: 'First client' },
]

export default function OnboardingPage() {
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [workspaceName, setWorkspaceName] = useState('')
  const [fullName, setFullName] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')

  async function handleComplete() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceName,
          fullName,
          clientName,
          clientEmail,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      router.push('/dashboard')
      router.refresh()

    } catch (err: unknown) {
      console.error('Onboarding error:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-4 py-12">

      {/* Logo */}
      <div className="mb-8">
        <span className="text-xl font-semibold text-neutral-900 tracking-tight">
          Client<span className="text-green-700">Nest</span>
        </span>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-xl shadow-sm p-8">

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step > s.id
                    ? 'bg-green-700 text-white'
                    : step === s.id
                    ? 'bg-green-700 text-white'
                    : 'bg-neutral-100 text-neutral-400'
                }`}>
                  {step > s.id ? <CheckCircle size={16} /> : s.id}
                </div>
                <span className={`text-xs ${step === s.id ? 'text-neutral-900 font-medium' : 'text-neutral-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-16 sm:w-24 mx-2 mb-4 ${step > s.id ? 'bg-green-700' : 'bg-neutral-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 — Workspace */}
        {step === 1 && (
          <div>
            <div className="mb-6">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-3">
                <Building2 size={20} className="text-green-700" />
              </div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-1">
                Name your workspace
              </h2>
              <p className="text-neutral-500 text-sm">
                This is usually your company name
              </p>
            </div>
            <div className="flex flex-col gap-1.5 mb-6">
              <label className="text-sm font-medium text-neutral-700">
                Workspace name
              </label>
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="Acme Inc."
                className="h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
              />
            </div>
          </div>
        )}

        {/* Step 2 — Your details */}
        {step === 2 && (
          <div>
            <div className="mb-6">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-3">
                <Users size={20} className="text-green-700" />
              </div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-1">
                Your details
              </h2>
              <p className="text-neutral-500 text-sm">
                How should we address you?
              </p>
            </div>
            <div className="flex flex-col gap-1.5 mb-6">
              <label className="text-sm font-medium text-neutral-700">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Smith"
                className="h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
              />
            </div>
          </div>
        )}

        {/* Step 3 — First client */}
        {step === 3 && (
          <div>
            <div className="mb-6">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-3">
                <Building2 size={20} className="text-green-700" />
              </div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-1">
                Add your first client
              </h2>
              <p className="text-neutral-500 text-sm">
                You can add more clients later
              </p>
            </div>
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">
                  Client name
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Client company name"
                  className="h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">
                  Client email <span className="text-neutral-400 font-normal">(optional)</span>
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@company.com"
                  className="h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            {step === 3 && (
              <button
                onClick={() => handleComplete()}
                className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                Skip
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !workspaceName.trim()}
                className="h-10 px-6 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="h-10 px-6 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Setting up...' : 'Get started'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}