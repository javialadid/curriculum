'use client';

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { cn, sendGAEvent } from '@/lib/utils'
import { Moon, Sun } from 'lucide-react'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Use resolvedTheme for display, fallback to theme, then default to 'light'
  const currentTheme = resolvedTheme || theme || 'light'

  // Prevent hydration mismatch by not rendering until mounted
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) {
    // Render a placeholder with consistent styling during SSR
    return (
      <button
        className={cn(
          'no-print relative h-9 w-9 rounded-full p-0 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none',
          'bg-background shadow-lg border border-border',
          className
        )}
        aria-label="Toggle theme"
      >
        <Sun className="h-5 w-5 absolute inset-0 m-auto transition-all duration-200 scale-100 opacity-100" />
        <Moon className="h-5 w-5 absolute inset-0 m-auto transition-all duration-200 scale-0 opacity-0" />
      </button>
    )
  }

  return (
    <button
      onClick={() => {
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        sendGAEvent('theme_toggle', { theme: newTheme });
      }}
      className={cn(
        'no-print relative h-9 w-9 rounded-full p-0 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none',
        'bg-background shadow-lg border border-border',
        className
      )}
      aria-label={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <Sun className={cn(
        'h-5 w-5 absolute inset-0 m-auto transition-all duration-200',
        currentTheme === 'light' ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
      )} />
      <Moon className={cn(
        'h-5 w-5 absolute inset-0 m-auto transition-all duration-200',
        currentTheme === 'light' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
      )} />
    </button>
  )
}
