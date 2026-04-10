import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'default' | 'ghost' | 'danger' | 'active'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: ReactNode
}

/**
 * Terminal-style flat button.
 * No border-radius, no shadows. CSS custom properties only.
 */
export function Button({
  variant = 'default',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`btn btn--${variant} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
