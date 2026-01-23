'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsChecking(true)
    setError('')

    // Simple password check
    if (password === 'ma5zani2026') {
      sessionStorage.setItem('adminPassword', password)
      router.push('/admin/dashboard')
    } else {
      setError('Invalid password')
    }
    setIsChecking(false)
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

        <Card className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              id="password"
              type="password"
              label="Admin Password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <Button type="submit" variant="primary" className="w-full" disabled={isChecking}>
              {isChecking ? 'Checking...' : 'Access Admin Panel'}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  )
}
