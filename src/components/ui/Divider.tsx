/**
 * Horizontal separator using border-top.
 */
export function Divider({ className = '' }: { className?: string }) {
  return <hr className={`divider ${className}`} aria-hidden="true" />
}
