import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  description: string
  confirmLabel: string
  keyword?: string
  isDangerous?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Reusable two-step confirmation dialog.
 * When keyword is provided, user must type it exactly to enable confirm.
 */
export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel,
  keyword,
  isDangerous = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const { t } = useTranslation()
  const [typedKeyword, setTypedKeyword] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const isConfirmDisabled = keyword !== undefined && typedKeyword !== keyword

  useEffect(() => {
    if (isOpen && keyword && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, keyword])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Enter' && !isConfirmDisabled) onConfirm()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, isConfirmDisabled, onConfirm, onCancel])

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <div className="confirm-dialog">
        <p className="confirm-dialog__desc">{description}</p>

        {keyword && (
          <div className="confirm-dialog__keyword">
            <label className="field-label">
              type "{keyword}" to confirm
            </label>
            <input
              ref={inputRef}
              className="field-input"
              value={typedKeyword}
              onChange={(e) => setTypedKeyword(e.target.value)}
              autoComplete="off"
            />
          </div>
        )}

        <div className="confirm-dialog__actions">
          <Button
            variant={isDangerous ? 'danger' : 'default'}
            disabled={isConfirmDisabled}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            [{t('common.cancel')}]
          </Button>
        </div>
      </div>
    </Modal>
  )
}
