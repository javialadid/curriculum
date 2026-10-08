'use client'

import { Printer } from 'lucide-react'
import { cn, sendGAEvent } from '@/lib/utils'

interface PrintButtonProps {
  className?: string
}

export function PrintButton({ className }: PrintButtonProps) {
  return (
    <button
      type="button"
      onClick={() => {
        sendGAEvent('print_cv', {})
        window.print()
      }}
      className={cn(
        'no-print inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium',
        'bg-background shadow-lg border border-border',
        'hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        className
      )}
      aria-label="Download PDF or Print"
    >
      <Printer className="h-4 w-4" aria-hidden="true" />
      <span>Download PDF / Print</span>
    </button>
  )
}
