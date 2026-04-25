import { useRef, useState } from 'react';
import { format } from 'date-fns';
import { useUIStore } from '@/stores/useUIStore';
import {
  exportTransactionsCSV,
  exportFinanceJSON,
  importFinanceJSON,
} from '@/utils/export';

/**
 * Settings section for financial data operations.
 * CSV export (month/all), JSON backup export, JSON backup import.
 */
export function FinanceDataSection() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const { finImportResult, setFinImportResult } = useUIStore();

  const currentMonth = format(new Date(), 'yyyy-MM');

  async function handleExportCsvMonth() {
    await exportTransactionsCSV({ scope: 'month', month: currentMonth });
  }

  async function handleExportCsvAll() {
    await exportTransactionsCSV({ scope: 'all' });
  }

  async function handleExportJson() {
    await exportFinanceJSON();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    const result = await importFinanceJSON(file);
    setFinImportResult(result);
    setIsImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="settings-section finance-data-section">
      <div className="settings-section-label">– finance data</div>

      <div className="settings-action-row">
        <button className="btn" onClick={handleExportCsvMonth}>
          [export csv ({currentMonth})]
        </button>
        <span className="settings-action-description">
          transactions for Excel / Google Sheets
        </span>
      </div>

      <div className="settings-action-row">
        <button className="btn" onClick={handleExportCsvAll}>
          [export csv (all time)]
        </button>
        <span className="settings-action-description">
          full transaction history
        </span>
      </div>

      <div className="settings-action-row">
        <button className="btn" onClick={handleExportJson}>
          [export json backup]
        </button>
        <span className="settings-action-description">
          full finance backup: transactions + categories + goals
        </span>
      </div>

      <div className="settings-action-row">
        <button
          className="btn"
          disabled={isImporting}
          onClick={() => fileInputRef.current?.click()}
        >
          {isImporting ? '[importing...]' : '[import json backup]'}
        </button>
        <span className="settings-action-description">
          restore from a habitd finance backup file
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {finImportResult.status === 'success' && (
        <p className="import-result-success">
          ✓ imported {finImportResult.transactionsImported} tx,{' '}
          {finImportResult.categoriesImported} categories,{' '}
          {finImportResult.budgetsImported} budgets,{' '}
          {finImportResult.goalsImported} goals
        </p>
      )}
      {finImportResult.status === 'error' && (
        <p className="import-result-error">✗ {finImportResult.errorMessage}</p>
      )}
    </div>
  );
}
