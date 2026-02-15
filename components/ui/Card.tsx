'use client'

import { HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered'
  hover?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'default', hover = false, children, ...props }, ref) => {
    const variants = {
      default: 'bg-white',
      elevated: 'bg-white shadow-lg',
      bordered: 'bg-white border-2 border-slate-200',
    }

    const hoverStyles = hover
      ? 'transition-all duration-300 hover:shadow-xl hover:-translate-y-1'
      : ''

    return (
      <div
        ref={ref}
        className={`rounded-2xl p-4 sm:p-6 ${variants[variant]} ${hoverStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export default Card
