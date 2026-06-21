import { Moon, Sun } from '@phosphor-icons/react'
import type { Theme } from '@/hooks/useTheme'

interface Props {
  theme: Theme
  onToggle: () => void
}

/** Light/dark mode toggle. */
export function ThemeToggle({ theme, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="grid size-8 place-items-center rounded-md border border-border text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
    >
      {theme === 'dark' ? <Sun size={15} weight="fill" /> : <Moon size={15} />}
    </button>
  )
}
