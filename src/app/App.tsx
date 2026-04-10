import { Sidebar } from '@/components/layout/Sidebar'
import { StatusBar } from '@/components/layout/StatusBar'
import { HabitsView }   from '@/views/HabitsView'
import { CalendarView } from '@/views/CalendarView'
import { StatsView }    from '@/views/StatsView'
import { SettingsView } from '@/views/SettingsView'
import { useUIStore } from '@/stores/useUIStore'

function ViewRouter() {
  const { activeView } = useUIStore()

  switch (activeView) {
    case 'habits':   return <HabitsView />
    case 'calendar': return <CalendarView />
    case 'stats':    return <StatsView />
    case 'settings': return <SettingsView />
    default:         return <HabitsView />
  }
}

export function App() {
  return (
    <div className="app-shell">
      <div className="app-body">
        <Sidebar />
        <ViewRouter />
      </div>
      <StatusBar />
    </div>
  )
}
