import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { useUIStore } from '@/stores/useUIStore'
import { exportToJSON, importFromJSON, exportToMarkdown } from '@/utils/export'

/**
 * DataSection — JSON export/import and Markdown export actions.
 */
export function DataSection() {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)
  const { importResult, setImportResult } = useUIStore()

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsImporting(true)
    const result = await importFromJSON(file)
    setImportResult(result)
    setIsImporting(false)
    e.target.value = ''
  }

  return (
    <section className="settings-section">
      <div className="settings-section-label">– {t('settings.data')}</div>

      <div className="settings-action-row">
        <Button onClick={() => exportToJSON()}>{t('settings.exportJson')}</Button>
        <span className="settings-action-description">
          {t('settings.exportJsonDesc')}
        </span>
      </div>

      <div className="settings-action-row">
        <Button onClick={handleImportClick} disabled={isImporting}>
          {isImporting ? `${t('common.save')}...` : t('settings.importJson')}
        </Button>
        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <span className="settings-action-description">
          {t('settings.importJsonDesc')}
        </span>
      </div>

      <div className="settings-action-row">
        <Button onClick={() => exportToMarkdown()}>{t('settings.exportMd')}</Button>
        <span className="settings-action-description">
          {t('settings.exportMdDesc')}
        </span>
      </div>

      {importResult.status !== 'idle' && (
        <div
          className={
            importResult.status === 'success'
              ? 'import-result-success'
              : 'import-result-error'
          }
          role="status"
        >
          {importResult.status === 'success'
            ? `✓ imported ${importResult.habitsImported} habits, ${importResult.completionsImported} completions`
            : `✗ ${importResult.errorMessage}`}
        </div>
      )}
    </section>
  )
}
