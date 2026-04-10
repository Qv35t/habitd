import { forwardRef, type SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-[var(--sp-1)]">
      {label && (
        <label className="text-[var(--font-size-xs)] text-[var(--text-muted)] uppercase tracking-widest">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`bg-[var(--bg-control)] border border-[var(--border-default)] text-[var(--text-primary)] px-[var(--sp-2)] py-[var(--sp-1)] font-mono text-[var(--font-size-base)] outline-none focus:border-[var(--border-active)] transition-colors duration-[var(--transition-fast)] ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: 'var(--bg-control)' }}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
)

Select.displayName = 'Select'
