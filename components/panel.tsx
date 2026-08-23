import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PanelProps {
  title: string
  children: ReactNode
  className?: string
  headerRight?: ReactNode
  accent?: 'green' | 'red' | 'cyan'
  bodyClassName?: string
}

const accentMap = {
  green: 'text-primary',
  red: 'text-alert',
  cyan: 'text-cyan',
}

export function Panel({
  title,
  children,
  className,
  headerRight,
  accent = 'green',
  bodyClassName,
}: PanelProps) {
  return (
    <section
      className={cn(
        'flex min-h-0 flex-col border border-border bg-panel',
        className,
      )}
    >
      <header className="flex items-center justify-between gap-2 border-b border-border bg-muted px-2 py-1">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-alert">■</span>
          <h2
            className={cn(
              'truncate text-[11px] font-bold uppercase tracking-widest',
              accentMap[accent],
            )}
          >
            {title}
          </h2>
        </div>
        {headerRight ? (
          <div className="shrink-0 text-[10px] text-muted-foreground">
            {headerRight}
          </div>
        ) : null}
      </header>
      <div className={cn('min-h-0 flex-1 overflow-auto p-3', bodyClassName)}>
        {children}
      </div>
    </section>
  )
}
