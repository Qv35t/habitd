import type { ButtonHTMLAttributes } from 'react'

type Variant = 'default' | 'active' | 'primary' | 'danger'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export function Pill({ variant = 'default', className = '', ...props }: Props) {
  const v = variant === 'default' ? '' : variant
  return (
    <button
      className={`pill ${v} ${className}`.trim()}
      {...props}
    />
  )
}