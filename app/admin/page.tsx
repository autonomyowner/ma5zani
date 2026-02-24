'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import Button from '@/components/ui/Button'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isChecking, setIsChecking] = useState(false)

  // Check if already logged in
  useEffect(() => {
    const savedPassword = sessionStorage.getItem('adminPassword')
    if (savedPassword) {
      router.push('/admin/dashboard')
    }
  }, [router])

  const verifyAdmin = useQuery(api.admin.verifyAdmin,
    password.length > 0 && isChecking ? { password } : "skip"
  )

  useEffect(() => {
    if (verifyAdmin === undefined || !isChecking) return
    if (verifyAdmin) {
      sessionStorage.setItem('adminPassword', password)
      router.push('/admin/dashboard')
    } else {
      setError('Invalid password')
    }
    setIsChecking(false)
  }, [verifyAdmin, isChecking, password, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsChecking(true)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="ma5zani"
            width={80}
            height={80}
            className="h-20 w-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-outfit)' }}>
            Admin Panel
          </h1>
          <p className="text-slate-400 mt-2">ma5zani Management Dashboard</p>
        </div>

        <div className="rounded-2xl p-8 bg-slate-800 border border-slate-700">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="w-full">
              <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                Admin Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-600 bg-slate-700 text-white placeholder:text-slate-400 transition-all duration-200 hover:border-slate-500 focus:border-[#00AEEF] focus:ring-0 focus:outline-none"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm font-medium">{error}</p>
            )}

            <Button type="submit" variant="primary" className="w-full" disabled={isChecking}>
              {isChecking ? 'Checking...' : 'Access Admin Panel'}
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}
