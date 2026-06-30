interface Props {
  variant: 'a' | 'b' | 'paper'
  tag: string
  value: string
  unit?: string
  note?: string
  overprint?: string
}

export function Sheet({ variant, tag, value, unit, note, overprint }: Props) {
  return (
    <div className={`sheet sheet--${variant}`}>
      <div className="sheet-tag">{tag}</div>
      <div className="sheet-num">
        {value}
        {unit && <span className="unit">{unit}</span>}
      </div>
      {note && <div className="sheet-note">{note}</div>}
      {overprint && <div className="sheet-overprint">{overprint}</div>}
    </div>
  )
}