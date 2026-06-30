import { useTranslation } from 'react-i18next'

export function DrumFootCard() {
  const { t } = useTranslation()
  return (
    <div className="drum-foot-iso">
      <div className="t">{t('drum.reminder.title', 'Daily reminder')}</div>
      <div className="d">{t('drum.reminder.desc', 'fill tonight, before the press cools')}</div>
    </div>
  )
}