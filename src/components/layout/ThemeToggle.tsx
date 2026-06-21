import { Moon, Sun } from '@phosphor-icons/react'
import { useTheme } from '@/hooks/useTheme'

/** Light/dark mode toggle. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="grid size-8 place-items-center rounded-md border border-border text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
    >
      {theme === 'dark' ? <Sun size={15} weight="fill" /> : <Moon size={15} />}
    </button>
  )
}
