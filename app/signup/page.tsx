'use client'

import Link from 'next/link'
import Image from 'next/image'
import { SignUp } from '@clerk/nextjs'

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-6 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#00AEEF]/5" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#F7941D]/5" />
      </div>

      <div className="max-w-md mx-auto">
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

        <div className="flex justify-center">
          <SignUp
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-xl rounded-2xl border border-slate-100',
              },
            }}
            routing="path"
            path="/signup"
            signInUrl="/login"
          />
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          <Link href="/" className="hover:text-[#0054A6] transition-colors">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  )
}
