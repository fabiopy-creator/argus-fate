'use client'

import { useState } from 'react'
import { Panel } from '@/components/panel'
import { type Target } from '@/lib/dashboard-data'
import { useReconStore } from '@/lib/recon-store'
import { cn } from '@/lib/utils'
import { Search, ShieldAlert, Crosshair, Globe } from 'lucide-react'

const STATUS_STYLES: Record<Target['status'], string> = {
  BREACHED: 'text-alert',
  PROBING: 'text-amber',
  LOCKED: 'text-cyan',
  ONLINE: 'text-primary',
}

// Convert longitude & latitude to SVG 800x400 map coordinates
function projectCoord(lon: number, lat: number): [number, number] {
  const x = ((lon + 180) / 360) * 800
  const y = ((90 - lat) / 180) * 400
  return [Math.max(10, Math.min(790, x)), Math.max(10, Math.min(390, y))]
}

// C2 Central Command Node (HQ)
const HQ_COORD: [number, number] = projectCoord(0, 51.5) // Greenwich Meridian anchor

// Stylized SVG world landmass paths for tactical display
const WORLD_PATHS = [
  // North America
  'M 110,60 L 220,50 L 270,70 L 290,110 L 260,160 L 210,180 L 170,170 L 140,130 L 100,90 Z',
  // South America
  'M 230,195 L 290,210 L 310,270 L 270,360 L 230,340 L 210,240 Z',
  // Europe
  'M 380,70 L 460,65 L 480,105 L 430,130 L 390,120 L 370,90 Z',
  // Africa
  'M 380,140 L 460,140 L 490,200 L 460,300 L 410,310 L 370,210 L 360,160 Z',
  // Asia / Eurasia
  'M 470,60 L 680,50 L 720,110 L 680,160 L 590,170 L 520,150 L 490,100 Z',
  // Australia & Oceania
  'M 630,250 L 710,240 L 730,310 L 660,330 L 620,290 Z',
  // Greenland
  'M 270,30 L 340,25 L 330,65 L 280,60 Z',
  // Japan archipelago
  'M 710,120 L 725,140 L 715,160 L 705,135 Z',
  // UK & Ireland
  'M 365,80 L 380,85 L 375,105 L 360,95 Z',
]

function WorldMap({
  targets,
  activeTarget,
  onSelectTarget,
}: {
  targets: Target[]
  activeTarget: string | null
  onSelectTarget: (ip: string) => void
}) {
  return (
    <div className="relative w-full overflow-hidden border border-border-dim bg-black">
      <svg
        viewBox="0 0 800 400"
        className="w-full h-auto select-none"
        style={{ background: '#020904' }}
      >
        <defs>
          {/* Cyber grid pattern */}
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="#0f4d2a"
              strokeWidth="0.3"
              strokeOpacity="0.4"
            />
          </pattern>

          {/* Glow filter */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Grid lines */}
        <rect width="800" height="400" fill="url(#grid)" />

        {/* Major Latitude/Longitude Coordinates */}
        <line x1="0" y1="200" x2="800" y2="200" stroke="#0f4d2a" strokeWidth="0.6" strokeDasharray="4 4" />
        <line x1="400" y1="0" x2="400" y2="400" stroke="#0f4d2a" strokeWidth="0.6" strokeDasharray="4 4" />

        {/* Continents Outline */}
        {WORLD_PATHS.map((d, index) => (
          <path
            key={index}
            d={d}
            fill="#051f10"
            stroke="#0f4d2a"
            strokeWidth="1"
            className="transition-colors hover:fill-[#08331a]"
          />
        ))}

        {/* Tactical Attack Vectors / Arcs from HQ */}
        {targets.map((t) => {
          const [tx, ty] = projectCoord(t.coordinates[0], t.coordinates[1])
          const [hx, hy] = HQ_COORD
          const midX = (hx + tx) / 2
          const midY = Math.min(hy, ty) - 30
          const isBreached = t.status === 'BREACHED'
          const isSelected = activeTarget === t.ip

          return (
            <g key={`vector-${t.ip}`}>
              <path
                d={`M ${hx},${hy} Q ${midX},${midY} ${tx},${ty}`}
                fill="none"
                stroke={isBreached ? '#ff0033' : isSelected ? '#00e0d0' : '#00ff66'}
                strokeWidth={isSelected ? 1.8 : 0.8}
                strokeDasharray={isSelected ? '6 3' : '4 4'}
                opacity={isSelected ? 1 : 0.4}
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="100"
                  to="0"
                  dur={isSelected ? '2.5s' : '4s'}
                  repeatCount="indefinite"
                />
              </path>
            </g>
          )
        })}

        {/* HQ Node */}
        <circle cx={HQ_COORD[0]} cy={HQ_COORD[1]} r="4" fill="#00e0d0" filter="url(#glow)" />
        <circle cx={HQ_COORD[0]} cy={HQ_COORD[1]} r="9" fill="none" stroke="#00e0d0" strokeWidth="0.8" opacity="0.6">
          <animate attributeName="r" from="4" to="16" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.8" to="0" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Target Nodes */}
        {targets.map((t) => {
          const [cx, cy] = projectCoord(t.coordinates[0], t.coordinates[1])
          const isBreached = t.status === 'BREACHED'
          const isSelected = activeTarget === t.ip
          const color = isBreached ? '#ff0033' : t.status === 'PROBING' ? '#ffb000' : '#00ff66'

          return (
            <g
              key={t.ip}
              className="cursor-pointer group"
              onClick={() => onSelectTarget(t.ip)}
            >
              {/* Radar pulse ping */}
              <circle cx={cx} cy={cy} r="6" fill="none" stroke={color} strokeWidth={isSelected ? 1.5 : 1} opacity="0.7">
                <animate attributeName="r" from="3" to={isSelected ? '18' : '12'} dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.9" to="0" dur="2s" repeatCount="indefinite" />
              </circle>

              {/* Center target dot */}
              <circle
                cx={cx}
                cy={cy}
                r={isSelected ? 5 : 3}
                fill={color}
                filter="url(#glow)"
              />

              {/* Target Label */}
              <text
                x={cx + 8}
                y={cy + 3}
                fill={color}
                fontSize="8"
                fontFamily="monospace"
                letterSpacing="0.5"
                fontWeight={isSelected ? 'bold' : 'normal'}
                opacity={isSelected ? 1 : 0.8}
                className="pointer-events-none"
              >
                {t.hostname ? `${t.hostname} [${t.code}]` : `${t.ip} [${t.code}]`}
              </text>
            </g>
          )
        })}

        {/* Coordinates HUD overlay */}
        <text x="12" y="24" fill="#00ff66" fontSize="9" fontFamily="monospace" opacity="0.7">
          LAT/LON GRID: ACTIVE // SECTOR 0-7 :: LIVE VECTORS [{targets.length}]
        </text>
        <text x="12" y="385" fill="#4a8f63" fontSize="8" fontFamily="monospace">
          PROJECTION: EQUIDISTANT CYBER-CYLINDRICAL // C2 ANCHOR: [0.00, 51.50]
        </text>
      </svg>
      <div className="pointer-events-none absolute inset-0 border border-primary/10" />
    </div>
  )
}

export function AttackMap() {
  const { targets, activeTarget, setActiveTarget, performRecon, isScanning } = useReconStore()
  const [query, setQuery] = useState('')

  const selectedTargetData = targets.find((t) => t.ip === activeTarget)

  async function handleQuickRecon(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim() || isScanning) return
    await performRecon(query.trim())
    setQuery('')
  }

  return (
    <Panel
      title="ATTACK MAP // GLOBAL TELEMETRY"
      accent="red"
      headerRight={
        <div className="flex items-center gap-2">
          {isScanning && (
            <span className="animate-pulse text-amber text-[10px]">
              ● SWEEPING TARGET...
            </span>
          )}
          <span className="text-[10px] text-primary">{targets.length} ACTIVE TARGETS</span>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        {/* Quick OSINT Search Bar directly on the HUD */}
        <form
          onSubmit={handleQuickRecon}
          className="flex items-center gap-2 border border-border bg-black/60 px-2 py-1.5"
        >
          <Crosshair className="size-3.5 text-alert shrink-0 animate-pulse" />
          <span className="text-[10px] font-mono text-muted-foreground uppercase shrink-0">
            TARGET RECON:
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="enter domain (e.g. google.com) or ip..."
            disabled={isScanning}
            className="flex-1 bg-transparent text-[11px] font-mono text-primary placeholder:text-muted-foreground/60 outline-none"
          />
          <button
            type="submit"
            disabled={isScanning || !query.trim()}
            className={cn(
              'border border-primary bg-primary/10 px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-mono text-primary transition-colors',
              'hover:bg-primary hover:text-black disabled:opacity-40 disabled:pointer-events-none cursor-pointer'
            )}
          >
            {isScanning ? 'SCANNING...' : 'ENGAGE SWEEP'}
          </button>
        </form>

        <WorldMap
          targets={targets}
          activeTarget={activeTarget}
          onSelectTarget={(ip) => setActiveTarget(activeTarget === ip ? null : ip)}
        />

        {/* Selected Target Dossier / Telemetry Card */}
        {selectedTargetData && (
          <div className="border border-cyan/40 bg-cyan/5 p-2 text-[10px] font-mono">
            <div className="flex items-center justify-between border-b border-cyan/20 pb-1 mb-1.5 text-cyan">
              <span className="font-bold flex items-center gap-1.5">
                <Globe className="size-3" />
                TARGET DOSSIER :: {selectedTargetData.hostname || selectedTargetData.ip}
              </span>
              <span className="text-[9px] uppercase">
                STATUS: <strong className={STATUS_STYLES[selectedTargetData.status]}>{selectedTargetData.status}</strong>
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-foreground/80">
              <div>
                <span className="text-muted-foreground block text-[9px]">IP ADDRESS</span>
                <span className="text-primary font-bold">{selectedTargetData.ip}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[9px]">LOCATION</span>
                <span>{selectedTargetData.city ? `${selectedTargetData.city}, ` : ''}{selectedTargetData.country} [{selectedTargetData.code}]</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[9px]">ISP / ASN</span>
                <span className="truncate block">{selectedTargetData.isp || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[9px]">SECURITY GRADE</span>
                <span className={cn(
                  'font-bold',
                  selectedTargetData.grade === 'A+' || selectedTargetData.grade === 'A' ? 'text-primary' :
                  selectedTargetData.grade === 'B' || selectedTargetData.grade === 'C' ? 'text-amber' : 'text-alert'
                )}>
                  {selectedTargetData.grade ? `[${selectedTargetData.grade}] Score: ${selectedTargetData.score}/100` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="mb-1 text-[10px] uppercase tracking-wider text-cyan flex items-center justify-between">
            <span>{'>'} MONITORED TARGET TELEMETRY</span>
            <span className="text-[9px] text-muted-foreground">Click a row to focus vector & trace</span>
          </div>
          <div className="overflow-x-auto max-h-48 overflow-y-auto">
            <table className="w-full min-w-85 border-collapse text-[10px] sm:text-[11px]">
              <thead className="sticky top-0 bg-panel border-b border-border">
                <tr className="text-left text-muted-foreground">
                  <th className="py-1 pr-2 font-normal">TARGET / HOST</th>
                  <th className="py-1 pr-2 font-normal">COUNTRY</th>
                  <th className="py-1 pr-2 font-normal">COORDINATES</th>
                  <th className="py-1 pr-2 font-normal">SECURITY</th>
                  <th className="py-1 font-normal">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {targets.map((t) => {
                  const isSelected = activeTarget === t.ip
                  return (
                    <tr
                      key={t.ip}
                      onClick={() => setActiveTarget(isSelected ? null : t.ip)}
                      className={cn(
                        'border-b border-border-dim last:border-0 cursor-pointer transition-colors',
                        isSelected ? 'bg-primary/15' : 'hover:bg-muted/40',
                      )}
                    >
                      <td className="py-1 pr-2 tabular-nums text-primary font-medium">
                        {t.hostname ? (
                          <div>
                            <div>{t.hostname}</div>
                            <div className="text-[9px] text-muted-foreground">{t.ip}</div>
                          </div>
                        ) : (
                          t.ip
                        )}
                      </td>
                      <td className="py-1 pr-2 text-muted-foreground">
                        <span className="text-cyan">[{t.code}]</span> {t.country}
                      </td>
                      <td className="py-1 pr-2 text-muted-foreground tabular-nums">
                        {t.coordinates[1].toFixed(2)}°, {t.coordinates[0].toFixed(2)}°
                      </td>
                      <td className="py-1 pr-2 text-muted-foreground tabular-nums">
                        {t.grade ? (
                          <span className={cn(
                            'font-bold',
                            t.grade === 'A+' || t.grade === 'A' ? 'text-primary' :
                            t.grade === 'B' || t.grade === 'C' ? 'text-amber' : 'text-alert'
                          )}>
                            [{t.grade}] {t.score}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </td>
                      <td className={cn('py-1 font-bold', STATUS_STYLES[t.status])}>
                        ● {t.status}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Panel>
  )
}
