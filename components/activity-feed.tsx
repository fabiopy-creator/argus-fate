'use client'

import { useEffect, useRef, useState } from 'react'
import { Panel } from '@/components/panel'
import {
  INITIAL_LOGS,
  LOG_SNIPPETS,
  type LogEntry,
  type LogLevel,
} from '@/lib/dashboard-data'
import { cn } from '@/lib/utils'

import { useReconStore } from '@/lib/recon-store'

const LEVEL_STYLES: Record<LogLevel, string> = {
  INFO: 'text-muted-foreground border-border',
  SCAN: 'text-cyan border-cyan',
  OPEN: 'text-primary border-primary',
  ALERT: 'text-alert border-alert',
  EXPLOIT: 'text-amber border-amber',
}

export function ActivityFeed({ className }: { className?: string }) {
  const { logs } = useReconStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = 0
  }, [logs])

  return (
    <Panel
      title="LIVE ACTIVITY FEED"
      accent="cyan"
      headerRight={<span className="text-primary">● STREAMING</span>}
      bodyClassName="p-0"
      className={className}
    >
      <div ref={scrollRef} className="h-full overflow-auto p-2">
        <ul className="space-y-[3px] text-[10px] leading-relaxed sm:text-[11px]">
          {logs.map((log, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {log.time}
              </span>
              <span
                className={cn(
                  'w-[58px] shrink-0 border px-1 text-center text-[9px] uppercase',
                  LEVEL_STYLES[log.level],
                )}
              >
                {log.level}
              </span>
              <span className="break-all text-foreground/90">
                {log.message}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-1 flex items-center gap-1 text-[10px] text-primary">
          <span className="animate-blink">▌</span>
          <span className="text-muted-foreground">awaiting events...</span>
        </div>
      </div>
    </Panel>
  )
}
