import type { ReactNode } from 'react'

interface Props {
  title: string
  link?: { label: string; onClick: () => void }
  right?: ReactNode
}

export function SectionHead({ title, link, right }: Props) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
      {link && (
        <button className="link" onClick={link.onClick}>
          {link.label}
        </button>
      )}
      {right}
    </div>
  )
}