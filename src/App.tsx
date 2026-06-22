import { useMemo, useState } from 'react'
import { Toaster } from 'sonner'
import { DataProvider, useData } from '@/lib/data/store'
import { AlgProgressProvider } from '@/lib/algs/progressStore'
import { useTheme } from '@/hooks/useTheme'
import { TimerScreen } from '@/app/TimerScreen'
import { TrainerView } from '@/components/trainer/TrainerView'
import { TriggersView } from '@/components/triggers/TriggersView'
import { CommandPalette, type Command } from '@/components/layout/CommandPalette'
import type { View } from '@/components/layout/NavTabs'

function AppShell() {
  const [view, setView] = useState<View>('timer')
  const [focus, setFocus] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { sessions, activeSession, addSession, setActiveSession } = useData()

  const commands = useMemo<Command[]>(() => {
    const base: Command[] = [
      { id: 'timer', label: 'Go to Timer', group: 'Navigate', run: () => setView('timer') },
      { id: 'trainer', label: 'Go to Trainer', group: 'Navigate', run: () => setView('trainer') },
      { id: 'triggers', label: 'Go to Triggers', group: 'Navigate', run: () => setView('triggers') },
      {
        id: 'new-scramble',
        label: 'New scramble',
        group: 'Timer',
        run: () => window.dispatchEvent(new CustomEvent('cube:new-scramble')),
      },
      { id: 'focus', label: focus ? 'Exit focus mode' : 'Enter focus mode', group: 'View', run: () => setFocus((f) => !f) },
      {
        id: 'theme',
        label: theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
        group: 'View',
        run: toggleTheme,
      },
      {
        id: 'new-session',
        label: 'New session',
        group: 'Sessions',
        run: () => addSession(`Session ${sessions.length + 1}`),
      },
      {
        id: 'export-csv',
        label: 'Export session (CSV)',
        group: 'Sessions',
        run: () => window.dispatchEvent(new CustomEvent('cube:export-csv')),
      },
    ]
    const sessionCmds: Command[] = sessions
      .filter((s) => s.id !== activeSession.id)
      .map((s) => ({
        id: `session-${s.id}`,
        label: `Switch to: ${s.name}`,
        group: 'Sessions',
        run: () => setActiveSession(s.id),
      }))
    return [...base, ...sessionCmds]
  }, [view, focus, theme, sessions, activeSession.id, toggleTheme, addSession, setActiveSession])

  return (
    <>
      {view === 'timer' ? (
        <TimerScreen
          view={view}
          onNavigate={setView}
          theme={theme}
          onToggleTheme={toggleTheme}
          focus={focus}
          onToggleFocus={() => setFocus((f) => !f)}
        />
      ) : view === 'triggers' ? (
        <TriggersView view={view} onNavigate={setView} theme={theme} onToggleTheme={toggleTheme} />
      ) : (
        <TrainerView view={view} onNavigate={setView} theme={theme} onToggleTheme={toggleTheme} />
      )}
      <CommandPalette commands={commands} />
    </>
  )
}

export default function App() {
  return (
    <DataProvider>
      <AlgProgressProvider>
        <AppShell />
      </AlgProgressProvider>
      <Toaster
        theme="system"
        position="bottom-center"
        toastOptions={{
          style: {
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--fg)',
          },
        }}
      />
    </DataProvider>
  )
}
