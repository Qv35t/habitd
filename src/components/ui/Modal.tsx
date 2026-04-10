import { type ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-[var(--bg-panel)] border border-[var(--border-default)] p-[var(--sp-4)] min-w-[320px] max-w-[480px] w-full mx-[var(--sp-4)]"
        role="dialog"
        aria-modal="true"
      >
        {title && (
          <div className="text-[var(--font-size-xs)] text-[var(--text-muted)] uppercase tracking-widest mb-[var(--sp-3)] border-b border-[var(--border-subtle)] pb-[var(--sp-2)]">
            {title}
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body
  )
}
