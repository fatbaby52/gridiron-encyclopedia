'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { isSupabaseConfigured } from '@/lib/supabase'

interface AuthFormProps {
  mode: 'login' | 'signup'
}

export function AuthForm({ mode }: AuthFormProps) {
  const { signInWithEmail, signUpWithEmail, signInWithProvider, loading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const configured = isSupabaseConfigured()

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)

      if (mode === 'login') {
        const result = await signInWithEmail(email, password)
        if (result.error) {
          setError(result.error)
        } else {
          const returnTo = new URLSearchParams(window.location.search).get('returnTo') || '/'
          window.location.href = returnTo
        }
      } else {
        const result = await signUpWithEmail(email, password)
        if (result.error) {
          setError(result.error)
        } else {
          setSuccess(true)
        }
      }
    },
    [mode, email, password, signInWithEmail, signUpWithEmail],
  )

  const handleOAuth = useCallback(
    async (provider: 'google' | 'facebook') => {
      setError(null)
      const result = await signInWithProvider(provider)
      if (result.error) {
        setError(result.error)
      }
    },
    [signInWithProvider],
  )

  if (!configured) {
    return (
      <div className="max-w-md mx-auto mt-16 p-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
          <h2 className="text-lg font-semibold text-amber-800 mb-2">Authentication Not Configured</h2>
          <p className="text-sm text-amber-700">
            User authentication requires Supabase configuration. Set the{' '}
            <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{' '}
            environment variables to enable this feature.
          </p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-16 p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-green-800 mb-2">Check Your Email</h2>
          <p className="text-sm text-green-700">
            We&apos;ve sent a confirmation link to <strong>{email}</strong>. Click the link to
            activate your account.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-8">
        <h1 className="text-2xl font-bold text-grass-dark dark:text-grass-light text-center mb-6">
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </h1>

        {/* OAuth buttons */}
        <div className="space-y-2 mb-6">
          <button
            onClick={() => handleOAuth('google')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
          <button
            onClick={() => handleOAuth('facebook')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Continue with Facebook
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white dark:bg-slate-900 px-3 text-xs text-gray-400 dark:text-gray-500 uppercase">or</span>
          </div>
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-grass/20 focus:border-grass outline-none dark:bg-slate-800 dark:text-gray-100"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-grass/20 focus:border-grass outline-none dark:bg-slate-800 dark:text-gray-100"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-grass text-white font-semibold rounded-lg hover:bg-grass-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-grass font-medium hover:underline">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link href="/auth/login" className="text-grass font-medium hover:underline">
                Sign in
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
