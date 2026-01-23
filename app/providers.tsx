'use client'

import { ReactNode } from 'react'
import { ClerkProvider, useAuth } from '@clerk/nextjs'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ConvexReactClient } from 'convex/react'
import { LanguageProvider } from '@/lib/LanguageContext'

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#0054A6',
          colorTextOnPrimaryBackground: '#ffffff',
          colorBackground: '#ffffff',
          colorInputBackground: '#ffffff',
          colorInputText: '#1e293b',
          borderRadius: '0.75rem',
        },
        elements: {
          formButtonPrimary: 'bg-[#F7941D] hover:bg-[#D35400] text-white',
          card: 'shadow-none',
          headerTitle: 'text-[#0054A6]',
          headerSubtitle: 'text-slate-600',
          socialButtonsBlockButton: 'border-slate-200 hover:border-slate-300',
          formFieldLabel: 'text-slate-900',
          formFieldInput: 'border-2 border-slate-200 focus:border-[#00AEEF]',
          footerActionLink: 'text-[#0054A6] hover:text-[#00AEEF]',
        },
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}
