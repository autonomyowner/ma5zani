'use client'

import { HTMLAttributes, forwardRef } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-slate-100 text-slate-700',
      success: 'bg-[#22B14C]/10 text-[#22B14C]',
      warning: 'bg-[#F7941D]/10 text-[#D35400]',
      error: 'bg-red-100 text-red-700',
      info: 'bg-[#00AEEF]/10 text-[#0054A6]',
    }

    return (
      <span
        ref={ref}
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export default Badge
