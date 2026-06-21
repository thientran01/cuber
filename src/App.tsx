import { useState } from 'react'
import { Toaster } from 'sonner'
import { DataProvider } from '@/lib/data/store'
import { AlgProgressProvider } from '@/lib/algs/progressStore'
import { TimerScreen } from '@/app/TimerScreen'
import { TrainerView } from '@/components/trainer/TrainerView'
import type { View } from '@/components/layout/NavTabs'

export default function App() {
  const [view, setView] = useState<View>('timer')

  return (
    <DataProvider>
      <AlgProgressProvider>
        {view === 'timer' ? (
          <TimerScreen view={view} onNavigate={setView} />
        ) : (
          <TrainerView view={view} onNavigate={setView} />
        )}
      </AlgProgressProvider>
      <Toaster
        theme="dark"
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
