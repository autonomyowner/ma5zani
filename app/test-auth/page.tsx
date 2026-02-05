'use client'

import { useEffect, useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

export default function TestAuthPage() {
  const { data: session, isPending, error } = authClient.useSession()
  const [cookies, setCookies] = useState<string>('')

  // Try to get seller profile
  const seller = useQuery(api.sellers.getCurrentSellerProfile)

  useEffect(() => {
    // Get cookies (client-side visible only)
    setCookies(document.cookie || 'No cookies found')
  }, [])

  const handleSignOut = async () => {
    await authClient.signOut()
    window.location.reload()
  }

  const handleTestGoogleSignIn = async () => {
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/test-auth',
      })
    } catch (err) {
      console.error('Google sign in error:', err)
      alert('Error: ' + (err as Error).message)
    }
  }

  const handleTestEmailSignIn = async () => {
    const email = prompt('Enter email:')
    const password = prompt('Enter password:')
    if (!email || !password) return

    try {
      const result = await authClient.signIn.email({ email, password })
      console.log('Sign in result:', result)
      if (result.error) {
        alert('Error: ' + result.error.message)
      } else {
        alert('Success! Reloading...')
        window.location.reload()
      }
    } catch (err) {
      console.error('Email sign in error:', err)
      alert('Error: ' + (err as Error).message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Auth Debug Page</h1>

        {/* Session Status */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Session Status</h2>
          <div className="space-y-2 font-mono text-sm">
            <p>
              <span className="text-slate-500">isPending:</span>{' '}
              <span className={isPending ? 'text-yellow-600' : 'text-green-600'}>
                {String(isPending)}
              </span>
            </p>
            <p>
              <span className="text-slate-500">session:</span>{' '}
              <span className={session ? 'text-green-600' : 'text-red-600'}>
                {session ? 'EXISTS' : 'NULL'}
              </span>
            </p>
            <p>
              <span className="text-slate-500">error:</span>{' '}
              <span className={error ? 'text-red-600' : 'text-slate-400'}>
                {error ? JSON.stringify(error) : 'none'}
              </span>
            </p>
          </div>
        </div>

        {/* Session Data */}
        {session && (
          <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Session Data</h2>
            <pre className="bg-slate-100 p-4 rounded overflow-auto text-xs">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        )}

        {/* Seller Profile */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Seller Profile (Convex)</h2>
          <div className="space-y-2 font-mono text-sm">
            <p>
              <span className="text-slate-500">seller:</span>{' '}
              <span className={seller ? 'text-green-600' : seller === null ? 'text-yellow-600' : 'text-slate-400'}>
                {seller ? 'EXISTS' : seller === null ? 'NULL (needs onboarding)' : 'undefined (loading...)'}
              </span>
            </p>
          </div>
          {seller && (
            <pre className="bg-slate-100 p-4 rounded overflow-auto text-xs mt-4">
              {JSON.stringify(seller, null, 2)}
            </pre>
          )}
        </div>

        {/* Cookies */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Browser Cookies</h2>
          <pre className="bg-slate-100 p-4 rounded overflow-auto text-xs whitespace-pre-wrap break-all">
            {cookies}
          </pre>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleTestGoogleSignIn}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Test Google Sign In
            </button>
            <button
              onClick={handleTestEmailSignIn}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Test Email Sign In
            </button>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Sign Out
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
            >
              Refresh Page
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">Debug Steps</h2>
          <ol className="list-decimal list-inside space-y-1 text-yellow-700 text-sm">
            <li>Check if "session" shows EXISTS or NULL</li>
            <li>If NULL after Google sign-in, cookies might not be set</li>
            <li>Check "Browser Cookies" for better-auth cookies</li>
            <li>Try "Test Email Sign In" with: test@test.com / testpassword123</li>
            <li>If email works but Google doesnt, its a redirect URI issue</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
