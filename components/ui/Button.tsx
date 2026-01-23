'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-[#F7941D] text-white hover:bg-[#D35400] active:bg-[#B8864C] focus:ring-[#F7941D]',
      secondary: 'bg-[#0054A6] text-white hover:bg-[#003d7a] active:bg-[#002d5c] focus:ring-[#0054A6]',
      outline: 'border-2 border-[#0054A6] text-[#0054A6] bg-transparent hover:bg-[#0054A6] hover:text-white active:bg-[#003d7a]',
      ghost: 'text-slate-600 bg-transparent hover:bg-slate-100 active:bg-slate-200',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm rounded-lg',
      md: 'px-6 py-3 text-base rounded-xl',
      lg: 'px-8 py-4 text-lg rounded-xl',
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
