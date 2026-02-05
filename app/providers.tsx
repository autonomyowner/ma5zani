'use client'

import { ReactNode } from 'react'
import { ConvexReactClient } from 'convex/react'
import { authClient } from '@/lib/auth-client'
import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react'
import { LanguageProvider } from '@/lib/LanguageContext'
import { SupportChat } from '@/components/SupportChat'

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      <LanguageProvider>
        {children}
        <SupportChat />
      </LanguageProvider>
    </ConvexBetterAuthProvider>
  )
}
