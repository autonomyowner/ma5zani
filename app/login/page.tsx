'use client'

import Link from 'next/link'
import Image from 'next/image'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-12 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#00AEEF]/5" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#0054A6]/5" />
        <div className="absolute top-1/2 left-1/4 w-px h-60 bg-gradient-to-b from-transparent via-[#F7941D]/20 to-transparent rotate-45" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <Image
              src="/logo.png"
              alt="ma5zani"
              width={80}
              height={80}
              className="h-20 w-auto"
            />
            <span
              className="text-3xl font-bold text-[#0054A6]"
              style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
            >
              ma5zani
            </span>
          </Link>
        </div>

        <Card variant="elevated" className="shadow-xl">
          <div className="text-center mb-8">
            <h1
              className="text-2xl font-bold text-[#0054A6] mb-2"
              style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
            >
              Welcome Back
            </h1>
            <p className="text-slate-600">
              Sign in to your seller dashboard
            </p>
          </div>

          <form className="space-y-6">
            <Input
              id="email"
              type="email"
              label="Email Address"
              placeholder="you@example.com"
            />

            <div>
              <Input
                id="password"
                type="password"
                label="Password"
                placeholder="Enter your password"
              />
              <div className="mt-2 text-right">
                <Link href="#" className="text-sm text-[#0054A6] hover:text-[#00AEEF] transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full">
              Sign In
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-600">
              Don't have an account?{' '}
              <Link href="/signup" className="text-[#0054A6] hover:text-[#00AEEF] font-medium transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </Card>

        <p className="mt-8 text-center text-sm text-slate-500">
          <Link href="/" className="hover:text-[#0054A6] transition-colors">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  )
}
