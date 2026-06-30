import { useTranslation } from 'react-i18next'
import { useHotkeys } from '@/hooks/useHotkeys'
import './HelpView.css'

function HotkeysTable({ keys }: { keys: Array<{ key: string; desc: string }> }) {
  return (
    <div className="help-key-table" role="table" aria-label="hotkeys">
      {keys.map(({ key, desc }) => (
        <div key={key} className="help-key-row" role="row">
          <kbd className="help-key" role="cell">{key}</kbd>
          <span className="help-key-desc" role="cell">{desc}</span>
        </div>
      ))}
    </div>
  )
}

function HelpSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="help-section">
      <h2 className="help-section-title">— {title}</h2>
      <div className="help-section-body">{children}</div>
    </section>
  )
}

export function HelpView() {
  const { t } = useTranslation()

  useHotkeys({
    escape: () => {},
  }, [])

  return (
    <main className="help-view" aria-label={t('help.title')}>
      {/* Headline */}
      <div className="headline">
        <div className="date">HELP</div>
        <h1>keyboard <span className="accent">shortcuts</span></h1>
        <div className="sub">all the keys that move through habitd — a reference card.</div>
      </div>

      <div className="help-columns">
        {/* LEFT: Navigation + Habits/Calendar/Stats/Tasks/Journal */}
        <div className="help-column">
          <HelpSection title={t('help.sections.habits')}>
            <HotkeysTable keys={[
              { key: 'H', desc: t('nav.habits') },
              { key: 'N', desc: t('help.keys.n') },
              { key: 'E', desc: t('help.keys.e') },
              { key: 'D', desc: t('help.keys.d') },
              { key: 'Esc', desc: t('help.keys.esc') },
            ]} />
          </HelpSection>

          <HelpSection title={t('help.sections.calendar')}>
            <HotkeysTable keys={[
              { key: 'C', desc: t('nav.calendar') },
              { key: '←', desc: t('help.finance.hotkeys.arrowleft') },
              { key: '→', desc: t('help.finance.hotkeys.arrowright') },
              { key: 'Esc', desc: t('common.close') },
            ]} />
          </HelpSection>

          <HelpSection title={t('help.sections.stats')}>
            <HotkeysTable keys={[
              { key: 'S', desc: t('nav.stats') },
              { key: '←', desc: t('help.finance.hotkeys.arrowleft') },
              { key: '→', desc: t('help.finance.hotkeys.arrowright') },
            ]} />
          </HelpSection>

          <HelpSection title={t('help.sections.tasks')}>
            <HotkeysTable keys={[
              { key: 'T', desc: t('nav.tasks') },
              { key: 'Space', desc: t('habits.today') },
              { key: 'D', desc: t('habits.delete') },
            ]} />
          </HelpSection>

          <HelpSection title={t('help.sections.journal')}>
            <HotkeysTable keys={[
              { key: 'J', desc: t('nav.journal') },
              { key: '←', desc: t('help.finance.hotkeys.arrowleft') },
              { key: '→', desc: t('help.finance.hotkeys.arrowright') },
              { key: 'Esc', desc: t('common.cancel') },
            ]} />
          </HelpSection>
        </div>

        {/* RIGHT: Finance sections + hotkeys */}
        <div className="help-column">
          <HelpSection title={t('help.sections.finance')}>
            <div className="help-subsection">
              <h3 className="help-subsection-title">{t('home.items.overview')}</h3>
              <p className="help-desc">{t('help.finance.overview.desc')}</p>
            </div>
            <div className="help-subsection">
              <h3 className="help-subsection-title">{t('home.items.transactions')}</h3>
              <p className="help-desc">{t('help.finance.transactions.desc')}</p>
            </div>
            <div className="help-subsection">
              <h3 className="help-subsection-title">{t('finance.budgets.title')}</h3>
              <p className="help-desc">{t('help.finance.budgets.desc')}</p>
            </div>
            <div className="help-subsection">
              <h3 className="help-subsection-title">{t('home.items.goals')}</h3>
              <p className="help-desc">{t('help.finance.goals.desc')}</p>
            </div>
            <div className="help-subsection">
              <h3 className="help-subsection-title">{t('finance.analytics.title')}</h3>
              <p className="help-desc">{t('help.finance.analytics.desc')}</p>
            </div>
            <HotkeysTable keys={[
              { key: '1', desc: t('help.finance.hotkeys.1') },
              { key: '2', desc: t('help.finance.hotkeys.2') },
              { key: '3', desc: t('help.finance.hotkeys.3') },
              { key: '4', desc: t('help.finance.hotkeys.4') },
              { key: '5', desc: t('help.finance.hotkeys.5') },
              { key: 'N', desc: t('help.finance.hotkeys.n') },
              { key: '←/→', desc: `${t('help.finance.hotkeys.arrowleft')} / ${t('help.finance.hotkeys.arrowright')}` },
              { key: 'Esc', desc: t('help.finance.hotkeys.escape') },
            ]} />
          </HelpSection>

          <HelpSection title={t('help.hotkeys')}>
            <div className="help-subsection">
              <h3 className="help-subsection-title">global</h3>
              <HotkeysTable keys={[
                { key: 'G', desc: t('nav.home') },
                { key: '/', desc: t('nav.help') },
                { key: ',', desc: t('nav.settings') },
                { key: 't', desc: t('nav.tasks') },
                { key: 'v', desc: t('nav.week') },
                { key: 'j', desc: t('nav.journal') },
              ]} />
            </div>
          </HelpSection>
        </div>
      </div>
    </main>
  )
}
