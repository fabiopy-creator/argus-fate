'use client'

import { useEffect, useState } from 'react'
import { Cpu, HardDrive, MemoryStick, Network } from 'lucide-react'
import { Panel } from '@/components/panel'

function AsciiBar({ value }: { value: number }) {
  const total = 20
  const filled = Math.round((value / 100) * total)
  const danger = value >= 80
  const warn = value >= 60 && value < 80
  const color = danger ? 'text-alert' : warn ? 'text-amber' : 'text-primary'
  return (
    <span className={`tabular-nums ${color}`}>
      [{'█'.repeat(filled)}
      <span className="text-border">{'░'.repeat(total - filled)}</span>]
    </span>
  )
}

function MetricRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Cpu
  label: string
  value: number
}) {
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <Icon className="size-4 shrink-0 text-cyan" strokeWidth={1.5} />
      <span className="w-10 shrink-0 text-muted-foreground">{label}</span>
      <div className="hidden flex-1 sm:block">
        <AsciiBar value={value} />
      </div>
      <div className="flex-1 sm:hidden">
        <AsciiBar value={value} />
      </div>
      <span
        className={`w-11 shrink-0 text-right tabular-nums ${
          value >= 80 ? 'text-alert' : 'text-primary'
        }`}
      >
        {value.toFixed(1)}%
      </span>
    </div>
  )
}

function useMetric(base: number, spread: number) {
  const [value, setValue] = useState(base)
  useEffect(() => {
    const id = setInterval(() => {
      setValue(() => {
        const next = base + (Math.random() - 0.5) * spread
        return Math.min(99.9, Math.max(2, next))
      })
    }, 2000)
    return () => clearInterval(id)
  }, [base, spread])
  return value
}

export function SystemMetrics() {
  const cpu = useMetric(63, 30)
  const mem = useMetric(71, 18)
  const disk = useMetric(48, 6)
  const rx = useMetric(120, 80)
  const tx = useMetric(64, 60)

  return (
    <Panel title="SYSTEM METRICS" accent="green" headerRight="NODE ARGUS-07">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <MetricRow icon={Cpu} label="CPU" value={cpu} />
          <MetricRow icon={MemoryStick} label="MEM" value={mem} />
          <MetricRow icon={HardDrive} label="DSK" value={disk} />
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-border-dim pt-2 text-[10px]">
          <div>
            <span className="text-muted-foreground">SYS STATUS: </span>
            <span className="text-primary">● ONLINE</span>
          </div>
          <div>
            <span className="text-muted-foreground">UPTIME: </span>
            <span className="text-primary tabular-nums">17d 04:12</span>
          </div>
          <div>
            <span className="text-muted-foreground">LOAD AVG: </span>
            <span className="text-primary tabular-nums">2.14 1.98 1.72</span>
          </div>
          <div>
            <span className="text-muted-foreground">THREATS: </span>
            <span className="text-alert tabular-nums">07 ACTIVE</span>
          </div>
        </div>

        <div className="border-t border-border-dim pt-2">
          <div className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wider text-cyan">
            <Network className="size-3" strokeWidth={1.5} /> NETWORK INTERFACES
          </div>
          <div className="space-y-1 text-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-primary">eth0</span>
              <span className="text-muted-foreground">10.0.3.19/24</span>
              <span className="tabular-nums text-cyan">
                ▼ {rx.toFixed(0)}MB/s
              </span>
              <span className="tabular-nums text-amber">
                ▲ {tx.toFixed(0)}MB/s
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-primary">tun0</span>
              <span className="text-muted-foreground">10.8.0.6/24</span>
              <span className="tabular-nums text-cyan">▼ 12MB/s</span>
              <span className="tabular-nums text-amber">▲ 8MB/s</span>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  )
}
