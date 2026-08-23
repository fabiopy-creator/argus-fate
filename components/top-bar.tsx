'use client'

import { useEffect, useState } from 'react'
import { Shield, Terminal, Volume2, VolumeX, Monitor, MonitorOff } from 'lucide-react'
import { useTheme, THEMES } from '@/lib/theme-store'
import { cn } from '@/lib/utils'

function useClock() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <span className="whitespace-nowrap">
      <span className="text-muted-foreground">{label}:</span>{' '}
      <span className="text-primary">{value}</span>
    </span>
  )
}

export function TopBar() {
  const now = useClock()
  const { theme, setTheme, crtEnabled, toggleCrt, sfxEnabled, toggleSfx } = useTheme()
  const [themeOpen, setThemeOpen] = useState(false)

  const timestamp = now
    ? now.toISOString().replace('T', ' ').slice(0, 19) + 'Z'
    : '------ --:--:--Z'

  return (
    <header className="flex flex-col gap-2 border border-border bg-panel px-3 py-2 lg:flex-row lg:items-center lg:justify-between">
      {/* Title */}
      <div className="flex items-center gap-2">
        <Shield className="size-5 shrink-0 text-alert" strokeWidth={1.5} />
        <h1 className="text-sm font-bold uppercase tracking-[0.2em] text-primary animate-flicker sm:text-base">
          ARGUS-FATE <span className="text-alert">CYBER OPERATIONS SUITE</span>
        </h1>
      </div>

      {/* Right side controls */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] sm:text-[11px]">
        <InfoItem label="USER" value="PANDORA" />
        <span className="hidden text-border sm:inline">│</span>
        <InfoItem label="HOST" value="localhost" />
        <span className="hidden text-border sm:inline">│</span>
        <span className="flex items-center gap-1 whitespace-nowrap">
          <Terminal className="size-3 text-cyan" strokeWidth={1.5} />
          <span className="text-cyan tabular-nums">{timestamp}</span>
        </span>

        <span className="hidden text-border sm:inline">│</span>

        {/* SFX Toggle */}
        <button
          type="button"
          onClick={toggleSfx}
          title={sfxEnabled ? 'Mute SFX' : 'Enable SFX'}
          className={cn(
            'flex items-center gap-1 border px-1.5 py-0.5 uppercase tracking-wider transition-colors cursor-pointer',
            sfxEnabled
              ? 'border-primary/50 text-primary hover:bg-primary/10'
              : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
          )}
        >
          {sfxEnabled ? <Volume2 className="size-3" /> : <VolumeX className="size-3" />}
          <span className="hidden sm:inline">{sfxEnabled ? 'SFX ON' : 'SFX OFF'}</span>
        </button>

        {/* CRT FX Toggle */}
        <button
          type="button"
          onClick={toggleCrt}
          title={crtEnabled ? 'Disable CRT effect' : 'Enable CRT effect'}
          className={cn(
            'flex items-center gap-1 border px-1.5 py-0.5 uppercase tracking-wider transition-colors cursor-pointer',
            crtEnabled
              ? 'border-cyan text-cyan bg-cyan/10 hover:bg-cyan/20'
              : 'border-border text-muted-foreground hover:border-cyan hover:text-cyan'
          )}
        >
          {crtEnabled ? <Monitor className="size-3" /> : <MonitorOff className="size-3" />}
          <span className="hidden sm:inline">CRT FX</span>
        </button>

        {/* Theme Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setThemeOpen((v) => !v)}
            className="flex items-center gap-1.5 border border-border px-1.5 py-0.5 uppercase tracking-wider text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
            title="Change tactical theme"
          >
            <span className="text-[10px]">◈</span>
            <span className="hidden sm:inline">THEME</span>
          </button>

          {themeOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-30"
                onClick={() => setThemeOpen(false)}
              />
              {/* Dropdown */}
              <div className="absolute right-0 top-full z-40 mt-1 min-w-44 border border-border bg-panel shadow-2xl shadow-black/80">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTheme(t.id)
                      setThemeOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center gap-2 px-3 py-1.5 text-left text-[10px] uppercase tracking-wider transition-colors cursor-pointer',
                      theme === t.id
                        ? 'bg-primary/15 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-primary'
                    )}
                  >
                    {theme === t.id && <span className="text-[8px]">▶</span>}
                    {theme !== t.id && <span className="text-[8px] opacity-0">▶</span>}
                    {t.shortLabel}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
