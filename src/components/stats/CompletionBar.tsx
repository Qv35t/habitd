interface CompletionBarProps {
  label?: string         // optional when showLabel is false
  value: number          // 0–100
  width?: number         // bar char width, default 20
  showLabel?: boolean    // default true
}

/**
 * ASCII horizontal progress bar.
 * Renders filled (█) and empty (░) block characters.
 */
export function CompletionBar({ label, value, width = 20, showLabel = true }: CompletionBarProps) {
  const filled = Math.round((Math.min(value, 100) / 100) * width)
  const empty = width - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)

  return (
    <div className="completion-bar">
      {showLabel && (
        <div className="completion-bar__label">{label}</div>
      )}
      <div className="completion-bar__row">
        <span className="completion-bar__track">[{bar}]</span>
        <span className="completion-bar__pct">{value.toFixed(1)}%</span>
      </div>
    </div>
  )
}
