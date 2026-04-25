import { useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { StatusBar } from '@/components/layout/StatusBar'
import { HelpView } from '@/views/HelpView'
import { HomeView } from '@/views/HomeView'
import { HabitsView } from '@/views/HabitsView'
import { CalendarView } from '@/views/CalendarView'
import { WeekView } from '@/views/WeekView'
import { JournalView } from '@/views/JournalView'
import { StatsView } from '@/views/StatsView'
import { TasksView } from '@/views/TasksView'
import { FinanceView } from '@/views/FinanceView'
import { SettingsView } from '@/views/SettingsView'
import { useUIStore } from '@/stores/useUIStore'
import { useHotkeys } from '@/hooks/useHotkeys'

function ViewRouter() {
  const { activeView } = useUIStore()

  switch (activeView) {
    case 'home':     return <HomeView />
    case 'habits':   return <HabitsView />
    case 'calendar': return <CalendarView />
    case 'week':     return <WeekView />
    case 'journal':  return <JournalView />
    case 'stats':    return <StatsView />
    case 'tasks':    return <TasksView />
    case 'finance':  return <FinanceView />
    case 'settings': return <SettingsView />
    case 'help':     return <HelpView />
    default:         return <HomeView />
  }
}

export function App() {
  const { theme, setActiveView } = useUIStore()

  // Apply theme on mount and clear stale language setting
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.removeItem('habitd-lang')
  }, [theme])

  // Global view-switching hotkeys
  useHotkeys({
    h: () => setActiveView('habits'),
    c: () => setActiveView('calendar'),
    s: () => setActiveView('stats'),
    ',': () => setActiveView('settings'),
    // Phase 12: new views
    t: () => setActiveView('tasks'),
    v: () => setActiveView('week'),
    j: () => setActiveView('journal'),
    g: () => setActiveView('home'),
    f: () => setActiveView('finance'),
    '/': () => setActiveView('help'),
    '?': () => setActiveView('help'),
  }, [])

  return (
    <>
      <div className="app-shell">
        <div className="app-body">
          <Sidebar />
          <main className="app-content">
            <ViewRouter />
          </main>
        </div>
        <StatusBar />
      </div>
      {/* HelpPanel kept for backward compat, use HelpView as main help page */}
    </>
  )
}
