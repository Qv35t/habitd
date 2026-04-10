import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-[var(--sp-1)]">
      {label && (
        <label className="text-[var(--font-size-xs)] text-[var(--text-muted)] uppercase tracking-widest">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`bg-[var(--bg-control)] border border-[var(--border-default)] text-[var(--text-primary)] px-[var(--sp-2)] py-[var(--sp-1)] font-mono text-[var(--font-size-base)] outline-none focus:border-[var(--border-active)] transition-colors duration-[var(--transition-fast)] ${className}`}
        {...props}
      />
      {error && (
        <span className="text-[var(--font-size-xs)] text-[var(--accent-red)]">{error}</span>
      )}
    </div>
  )
)

Input.displayName = 'Input'
