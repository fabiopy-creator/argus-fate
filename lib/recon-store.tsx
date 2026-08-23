'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { TARGETS, INITIAL_LOGS, type Target, type LogEntry, type LogLevel, LOG_SNIPPETS } from '@/lib/dashboard-data'
import type { ReconReport } from '@/app/api/recon/route'
import { playScanSweep, playRadarPing, playAlertAlarm, playSuccessChime } from '@/lib/audio-engine'

interface ReconContextType {
  targets: Target[]
  activeTarget: string | null
  setActiveTarget: (ip: string | null) => void
  logs: LogEntry[]
  addLog: (level: LogLevel, message: string) => void
  performRecon: (target: string) => Promise<ReconReport | null>
  isScanning: boolean
  lastReport: ReconReport | null
  activeModuleModal: string | null
  setActiveModuleModal: (id: string | null) => void
}

const ReconContext = createContext<ReconContextType | null>(null)

function getCurrentTime(): string {
  const now = new Date()
  return now.toTimeString().split(' ')[0]
}

export function ReconProvider({ children }: { children: ReactNode }) {
  const [targets, setTargets] = useState<Target[]>(TARGETS)
  const [activeTarget, setActiveTarget] = useState<string | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS)
  const [isScanning, setIsScanning] = useState(false)
  const [lastReport, setLastReport] = useState<ReconReport | null>(null)
  const [activeModuleModal, setActiveModuleModal] = useState<string | null>(null)

  const addLog = useCallback((level: LogLevel, message: string) => {
    setLogs((prev) => {
      const updated = [{ time: getCurrentTime(), level, message }, ...prev]
      return updated.slice(0, 50) // keep latest 50
    })
  }, [])

  // Background random ambient telemetry logs
  useEffect(() => {
    const interval = setInterval(() => {
      const snippet = LOG_SNIPPETS[Math.floor(Math.random() * LOG_SNIPPETS.length)]
      addLog(snippet.level as LogLevel, snippet.message)
    }, 9000)
    return () => clearInterval(interval)
  }, [addLog])

  const performRecon = useCallback(
    async (rawTarget: string): Promise<ReconReport | null> => {
      const clean = rawTarget.trim().replace(/^https?:\/\//i, '').split('/')[0]
      if (!clean) return null

      setIsScanning(true)
      addLog('SCAN', `initiating deep reconnaissance sweep on :: ${clean}`)
      playScanSweep()

      try {
        const res = await fetch('/api/recon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target: clean }),
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || `Recon sweep failed with status ${res.status}`)
        }

        const report: ReconReport = await res.json()
        setLastReport(report)

        // Log findings
        addLog('INFO', `DNS resolution complete :: ${report.ip} (${report.dns.a.length} A records)`)
        if (report.geo) {
          addLog(
            'INFO',
            `telemetry geolocated :: ${report.geo.city || 'Unknown'}, ${report.geo.country} [${report.geo.countryCode}] - ISP: ${report.geo.isp}`
          )
        }

        const statusStyle: Target['status'] =
          report.security.grade === 'F' || report.security.grade === 'D'
            ? 'BREACHED'
            : report.security.grade === 'C'
            ? 'PROBING'
            : 'ONLINE'

        // Play audio feedback based on security grade
        if (statusStyle === 'BREACHED') {
          playAlertAlarm()
        } else if (statusStyle === 'ONLINE') {
          playSuccessChime()
        } else {
          playRadarPing()
        }

        addLog(
          statusStyle === 'BREACHED' ? 'ALERT' : 'OPEN',
          `security posture evaluated :: Grade [${report.security.grade}] (Score: ${report.security.score}/100)`
        )

        // Add or update target on map
        const coords: [number, number] =
          report.geo?.lon && report.geo?.lat
            ? [report.geo.lon, report.geo.lat]
            : [0, 20]

        const newTarget: Target = {
          ip: report.ip,
          hostname: report.hostname,
          country: report.geo?.country?.toUpperCase() || 'UNKNOWN',
          code: report.geo?.countryCode || 'XX',
          city: report.geo?.city,
          isp: report.geo?.isp,
          score: report.security.score,
          grade: report.security.grade,
          status: statusStyle,
          coordinates: coords,
        }

        setTargets((prev) => {
          const filtered = prev.filter((t) => t.ip !== newTarget.ip)
          return [newTarget, ...filtered]
        })

        setActiveTarget(newTarget.ip)
        return report
      } catch (err: any) {
        addLog('ALERT', `recon sweep error :: ${err?.message || 'Unknown network error'}`)
        return null
      } finally {
        setIsScanning(false)
      }
    },
    [addLog]
  )

  return (
    <ReconContext.Provider
      value={{
        targets,
        activeTarget,
        setActiveTarget,
        logs,
        addLog,
        performRecon,
        isScanning,
        lastReport,
        activeModuleModal,
        setActiveModuleModal,
      }}
    >
      {children}
    </ReconContext.Provider>
  )
}

export function useReconStore() {
  const context = useContext(ReconContext)
  if (!context) {
    throw new Error('useReconStore must be used within a ReconProvider')
  }
  return context
}
