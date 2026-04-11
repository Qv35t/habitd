import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useUIStore } from '@/stores/useUIStore'
import { exportToJSON, importFromJSON, exportToMarkdown } from '@/utils/export'

/**
 * DataSection — JSON export/import and Markdown export actions.
 */
export function DataSection() {
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
    // Reset input so same file can be re-imported
    e.target.value = ''
  }

  return (
    <section className="settings-section">
      <div className="settings-section-label">– data</div>

      <div className="settings-action-row">
        <Button onClick={() => exportToJSON()}>[export json]</Button>
        <span className="settings-action-description">
          export all habits &amp; logs to .json
        </span>
      </div>

      <div className="settings-action-row">
        <Button onClick={handleImportClick} disabled={isImporting}>
          {isImporting ? '[importing...]' : '[import json]'}
        </Button>
        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <span className="settings-action-description">
          restore from a habitd backup file
        </span>
      </div>

      <div className="settings-action-row">
        <Button onClick={() => exportToMarkdown()}>[export markdown]</Button>
        <span className="settings-action-description">
          plain-text habit report
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
