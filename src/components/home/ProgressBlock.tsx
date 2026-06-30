interface Props {
  label: string
  done: number
  total: number
  pct: number
}

export function ProgressBlock({ label, done, total, pct }: Props) {
  return (
    <div className="progress-block-iso">
      <div className="label" style={{ position: 'relative', zIndex: 1 }}>
        {label}
      </div>
      <div className="bar">
        {Array.from({ length: total }).map((_, i) => (
          <i key={i} className={i < done ? 'on' : ''} />
        ))}
      </div>
      <div className="pct" style={{ position: 'relative', zIndex: 1 }}>
        {pct}%
      </div>
    </div>
  )
}