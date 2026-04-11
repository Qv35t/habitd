import { useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { StatusBar } from '@/components/layout/StatusBar'
import { HelpPanel } from '@/components/HelpPanel'
import { HomeView } from '@/views/HomeView'
import { HabitsView } from '@/views/HabitsView'
import { CalendarView } from '@/views/CalendarView'
import { StatsView } from '@/views/StatsView'
import { SettingsView } from '@/views/SettingsView'
import { useUIStore } from '@/stores/useUIStore'
import { useHotkeys } from '@/hooks/useHotkeys'

function ViewRouter() {
  const { activeView } = useUIStore()

  switch (activeView) {
    case 'home':     return <HomeView />
    case 'habits':   return <HabitsView />
    case 'calendar': return <CalendarView />
    case 'stats':    return <StatsView />
    case 'settings': return <SettingsView />
    default:         return <HomeView />
  }
}

export function App() {
  const { theme, setActiveView } = useUIStore()

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Global view-switching hotkeys
  useHotkeys({
    h: () => setActiveView('habits'),
    c: () => setActiveView('calendar'),
    s: () => setActiveView('stats'),
    ',': () => setActiveView('settings'),
  }, [])

  return (
    <>
      <div className="app-shell">
        <div className="app-body">
          <Sidebar />
          <ViewRouter />
        </div>
        <StatusBar />
      </div>
      <HelpPanel />
    </>
  )
}
