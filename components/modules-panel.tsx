'use client'

import { useState } from 'react'
import { ChevronRight, Zap } from 'lucide-react'
import { Panel } from '@/components/panel'
import { MODULES, type Tag } from '@/lib/dashboard-data'
import { useReconStore } from '@/lib/recon-store'
import { getModuleModal } from '@/components/module-modals'
import { cn } from '@/lib/utils'

const INTERACTIVE_IDS = new Set(['07', '08', '09', '11', '18'])

function TagBadge({ tag }: { tag: Tag }) {
  if (!tag) return null
  const isHot = tag === 'Hot Results'
  const isFixed = tag === 'Fixed'
  return (
    <span
      className={cn(
        'shrink-0 border px-1 text-[9px] uppercase tracking-wider',
        isHot && 'border-alert text-alert',
        isFixed && 'border-amber text-amber',
        !isHot && !isFixed && 'border-cyan text-cyan',
      )}
    >
      {tag}
    </span>
  )
}

export function ModulesPanel({ className }: { className?: string }) {
  const [active, setActive] = useState('01')
  const { setActiveModuleModal } = useReconStore()

  return (
    <Panel
      title="AVAILABLE MODULES"
      accent="green"
      headerRight={`${MODULES.length} LOADED`}
      bodyClassName="p-0"
      className={className}
    >
      <ul>
        {MODULES.map((mod) => {
          const isActive = active === mod.id
          const isInteractive = INTERACTIVE_IDS.has(mod.id)
          const hasModal = !!getModuleModal(mod.id)

          return (
            <li key={mod.id}>
              <button
                type="button"
                onClick={() => {
                  setActive(mod.id)
                  if (hasModal) {
                    setActiveModuleModal(mod.id)
                  }
                }}
                aria-pressed={isActive}
                title={hasModal ? `Launch ${mod.name} module` : undefined}
                className={cn(
                  'flex w-full items-center gap-2 border-b border-border-dim px-2 py-1 text-left text-[11px] transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-primary',
                )}
              >
                <ChevronRight
                  className={cn(
                    'size-3 shrink-0',
                    isActive ? 'text-alert' : 'text-transparent',
                  )}
                  strokeWidth={2}
                />
                <span className="w-6 shrink-0 tabular-nums text-cyan">
                  {mod.id}
                </span>
                <span className="flex-1 truncate uppercase tracking-wide">
                  {mod.name}
                </span>
                {hasModal && (
                  <span title="Interactive module" className="flex items-center">
                    <Zap className="size-3 shrink-0 text-amber opacity-70" strokeWidth={2} />
                  </span>
                )}
                <TagBadge tag={mod.tag} />
              </button>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}
