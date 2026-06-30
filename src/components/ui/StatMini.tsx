interface Props {
  label: string
  value: string
  valueClass?: 'a' | 'b'
  note?: string
  spark?: string
  trend?: { dir: 'up' | 'down'; text: string }
  children?: React.ReactNode
}

export function StatMini({ label, value, valueClass, note, spark, trend, children }: Props) {
  return (
    <div className="stat-mini halftone halftone--ink-a">
      <div className="label">{label}</div>
      <div className={`value ${valueClass ?? ''}`}>{value}</div>
      {note && <div className="note">{note}</div>}
      {spark && <div className="spark">{spark}</div>}
      {trend && <span className={`trend ${trend.dir}`}>{trend.text}</span>}
      {children}
    </div>
  )
}