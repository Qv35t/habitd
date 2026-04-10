export function Divider({ className = '' }: { className?: string }) {
  return (
    <hr
      className={`border-none border-t border-[var(--border-subtle)] my-[var(--sp-2)] ${className}`}
      style={{ borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'var(--border-subtle)' }}
    />
  )
}
