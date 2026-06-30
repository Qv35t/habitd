import { useUIStore } from '@/stores/useUIStore'
import { useTranslation } from 'react-i18next'
import { SCHEME_NAMES } from '@/types'
import type { SchemeName } from '@/types'

export function SchemeSwitcher() {
  const { scheme, setScheme } = useUIStore()
  const { t } = useTranslation()

  return (
    <div className="scheme-switcher">
      <div className="sh">{t('settings.scheme.title', 'INK DRUMS')}</div>
      <div className="swatches">
        {SCHEME_NAMES.map((name: SchemeName) => (
          <button
            key={name}
            className={`swatch swatch--${name} ${scheme === name ? 'active' : ''}`}
            onClick={() => setScheme(name)}
            aria-label={t(`settings.scheme.${name}`, name)}
            aria-pressed={scheme === name}
          >
            <span className="preview-a" />
            <span className="preview-b" />
          </button>
        ))}
      </div>
      <div className="name-label">
        {t(`settings.scheme.${scheme}`, scheme)}
      </div>
    </div>
  )
}