import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { useUIStore } from '@/stores/useUIStore'
import { useHomeData } from '@/hooks/useHomeData'
import { Sheet } from '@/components/ui/Sheet'
import { SectionHead } from '@/components/home/SectionHead'
import { ProgressBlock } from '@/components/home/ProgressBlock'
import { formatAmount } from '@/utils/currency'

export function HomeView() {
  const { t } = useTranslation()
  const { setActiveView, setFinanceTab, localeLayout } = useUIStore()
  const data = useHomeData()

  const done = data?.doneToday ?? 0
  const total = data?.totalActive ?? 0
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const balK = Math.round((data?.monthBalance ?? 0) / 1000)

  return (
    <div className="home-view-iso">
      <div className="headline">
        <div className="date">{format(new Date(), 'EEE · d MMM · yyyy').toUpperCase()}</div>
        <h1>
          {t('home.hero.title', "today's")}{' '}
          <span className="accent">{t('home.hero.accent', 'log')}</span>
        </h1>
        <div className="sub">{t('home.hero.sub', 'two habits left to set before the day closes. press on.')}</div>
      </div>

      <div className="sheets">
        <Sheet
          variant="a"
          tag={t('home.sheets.done.tag', 'DONE')}
          value={String(done)}
          unit={`/ ${total}`}
          note={t('home.sheets.done.note', 'habits set today')}
          overprint={String(total || '7')}
        />
        <Sheet
          variant="b"
          tag={t('home.sheets.streak.tag', 'STREAK')}
          value={String(data?.bestStreak ?? '–')}
          unit={t('home.sheets.streak.unit', 'days')}
          note={data?.bestStreakHabitName ?? '—'}
          overprint="∞"
        />
        <Sheet
          variant="paper"
          tag={t('home.sheets.balance.tag', 'BALANCE')}
          value={balK > 0 ? `+${balK}` : String(balK)}
          unit="K ₽"
          note={t('home.sheets.balance.note', 'this month')}
          overprint="₽"
        />
      </div>

      <ProgressBlock
        label={t('home.progress.label', "today's press")}
        done={done}
        total={total || 7}
        pct={pct}
      />

      <SectionHead
        title={t('home.sectionsShort.habits', 'habits')}
        link={{ label: 'SEE ALL →', onClick: () => setActiveView('habits') }}
      />
      <div className="habit-cards-iso">
        {data?.habits.map((h) => (
          <div
            key={h.id}
            className={`habit-card-iso ${h.doneToday ? 'done' : 'pending'}`}
            onClick={() => setActiveView('habits')}
          >
            {h.doneToday && <span className="check-mark">✓</span>}
            <div className={`habit-symbol-iso ${h.doneToday ? 'done' : 'pending'}`}>{h.symbol}</div>
            <div className="habit-name-iso">{h.name}</div>
            <div className="habit-desc-iso">{h.desc}</div>
            <div className="habit-dots-iso">
              {h.dots.map((d, i) => (
                <span key={i} className={d ? 'on' : 'off'}>
                  {d ? '●' : '○'}
                </span>
              ))}
            </div>
            <div className="habit-streak-iso">
              {h.streak}
              <span className="u">d</span>
            </div>
          </div>
        ))}
        {!data && (
          <div className="home-empty" style={{ gridColumn: '1 / -1', color: 'var(--text-dim)', padding: 'var(--sp-6)' }}>
            Loading…
          </div>
        )}
      </div>

      <SectionHead
        title={t('home.sectionsShort.finance', 'finance')}
        link={{
          label: 'SEE ALL →',
          onClick: () => {
            setActiveView('finance')
            setFinanceTab('overview')
          },
        }}
      />
      <div className="fin-grid-iso">
        <div className="fin-card-iso income">
          <div className="fin-tag">INCOME · {format(new Date(), 'MMM yyyy').toUpperCase()}</div>
          <div className="fin-amt">+{formatAmount(data?.monthIncome ?? 0, localeLayout)}</div>
          <div className="fin-sub">{data?.monthTxCount ?? 0} tx</div>
          {data && data.monthIncomeTxs.length > 0 && (
            <div className="ledger-mini">
              {data.monthIncomeTxs.map((tx, i) => (
                <div key={i} className="row">
                  <span className="lbl">{tx.date.slice(8)} · {tx.categoryName}</span>
                  <span className="amt in">+{formatAmount(tx.amount, localeLayout)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="fin-card-iso expense">
          <div className="fin-tag">EXPENSE · {format(new Date(), 'MMM yyyy').toUpperCase()}</div>
          <div className="fin-amt">−{formatAmount(data?.monthExpense ?? 0, localeLayout)}</div>
          <div className="fin-sub">{data?.monthTxCount ?? 0} tx</div>
          {data && data.monthExpenseTxs.length > 0 && (
            <div className="ledger-mini">
              {data.monthExpenseTxs.map((tx, i) => (
                <div key={i} className="row">
                  <span className="lbl">{tx.date.slice(8)} · {tx.categoryName}</span>
                  <span className="amt out">−{formatAmount(tx.amount, localeLayout)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}