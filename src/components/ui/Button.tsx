import { forwardRef, type ButtonHTMLAttributes } from 'react'

type Variant = 'default' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const variantStyles: Record<Variant, string> = {
  default: 'border border-[var(--border-default)] text-[var(--text-primary)] hover:border-[var(--border-active)] bg-transparent',
  danger:  'border border-[var(--accent-red-bg)] text-[var(--accent-red)] hover:border-[var(--accent-red)] bg-transparent',
  ghost:   'border-none text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => (
    <button
      ref={ref}
      className={`px-[var(--sp-3)] py-[var(--sp-1)] font-mono text-[var(--font-size-sm)] transition-colors duration-[var(--transition-fast)] disabled:opacity-40 disabled:cursor-not-allowed ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
)

Button.displayName = 'Button'
