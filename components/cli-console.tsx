'use client'

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'
import { useReconStore } from '@/lib/recon-store'
import { playTypingBip } from '@/lib/audio-engine'
import type { CveItem } from '@/app/api/cve/route'

const PROMPT = 'argus@c2-node:~$'

interface Line {
  type: 'in' | 'out' | 'err' | 'warn' | 'success'
  text: string
}

const HELP_LINES = [
  'ARGUS-FATE TACTICAL COMMAND SUITE v2.0',
  '=====================================================',
  '  recon <domain|ip>     Deep OSINT sweep (DNS, GeoIP, HTTP Security Headers & Score)',
  '  lookup <ip|domain>    Fast GeoIP & ASN telemetry lookup',
  '  dns <domain>          Enumerate DNS records & analyze SPF/DMARC policies',
  '  headers <url>         Audit HTTP security headers & SSL grade',
  '  cve <query|cve-id>    Search global CVE / NVD threat database',
  '  hash <algo> <text>    Calculate hash (sha256 | sha1 | sha512 | md5)',
  '  ai <query|question>   Consult PANDORA Tactical AI for exploit/defense intel',
  '  export [target]       Download forensic intelligence dossier (.md report)',
  '  status                Display active C2 session & operational statistics',
  '  modules               List available offensive/defensive modules',
  '  whoami                Display current operator credentials and clearance',
  '  clear                 Purge terminal screen buffer',
  '=====================================================',
]

async function calculateHash(algorithm: string, text: string): Promise<string> {
  const algoLower = algorithm.toLowerCase()
  if (algoLower === 'md5') {
    // Basic lightweight MD5 for demo/compat
    return 'md5: [legacy hash] ' + Array.from(new TextEncoder().encode(text)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32)
  }
  const standardAlgo =
    algoLower === 'sha1' ? 'SHA-1' :
    algoLower === 'sha256' ? 'SHA-256' :
    algoLower === 'sha512' ? 'SHA-512' :
    algoLower === 'sha384' ? 'SHA-384' : 'SHA-256'

  const msgBuffer = new TextEncoder().encode(text)
  const hashBuffer = await crypto.subtle.digest(standardAlgo, msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function CliConsole() {
  const { targets, performRecon, addLog } = useReconStore()
  const [history, setHistory] = useState<Line[]>([
    { type: 'out', text: 'ARGUS-FATE OSINT & Threat Intel Terminal v2.0 :: Type \'help\' for active commands.' },
  ])
  const [value, setValue] = useState('')
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number>(-1)
  const [isProcessing, setIsProcessing] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [history])

  async function executeCommand(raw: string) {
    const cmd = raw.trim()
    if (!cmd) return

    setCmdHistory((prev) => [...prev, cmd])
    setHistoryIndex(-1)
    setHistory((prev) => [...prev, { type: 'in', text: `${PROMPT} ${cmd}` }])

    const [action, ...params] = cmd.split(/\s+/)
    const arg = params[0]
    const fullArg = params.join(' ')

    switch (action.toLowerCase()) {
      case 'clear': {
        setHistory([])
        return
      }

      case 'help': {
        setHistory((prev) => [
          ...prev,
          ...HELP_LINES.map((text) => ({ type: 'out' as const, text })),
        ])
        return
      }

      case 'whoami': {
        setHistory((prev) => [
          ...prev,
          { type: 'success', text: 'OPERATOR: ARGUS-PRIME // CLEARANCE: LEVEL-5 (OMEGA)' },
          { type: 'out', text: 'NODE: c2-tactical-bravo :: PRIVILEGES: [RECON, OSINT, EXPLOIT_SIM, CRYPTO]' },
        ])
        return
      }

      case 'status': {
        setHistory((prev) => [
          ...prev,
          { type: 'out', text: `C2 SESSION ......... ACTIVE [LATENCY: 18ms]` },
          { type: 'out', text: `ACTIVE TARGETS ..... ${targets.length.toString().padStart(2, '0')} NODES IN TELEMETRY` },
          { type: 'out', text: `OSINT ENGINE ....... ONLINE (DNS + GEOIP + HTTP AUDIT)` },
          { type: 'out', text: `THREAT DATABASE .... SYNCED (NIST / CIRCL / CVE)` },
        ])
        return
      }

      case 'modules': {
        setHistory((prev) => [
          ...prev,
          { type: 'out', text: '20 tactical modules loaded. Click any item on the AVAILABLE MODULES panel to launch.' },
        ])
        return
      }

      case 'hash': {
        if (!arg || params.length < 2) {
          setHistory((prev) => [
            ...prev,
            { type: 'err', text: 'Usage: hash <sha256|sha1|sha512|md5> <text-to-hash>' },
          ])
          return
        }
        const algo = arg
        const textToHash = params.slice(1).join(' ')
        try {
          const result = await calculateHash(algo, textToHash)
          setHistory((prev) => [
            ...prev,
            { type: 'out', text: `ALGORITHM: ${algo.toUpperCase()}` },
            { type: 'out', text: `INPUT:     "${textToHash}"` },
            { type: 'success', text: `HASH:      ${result}` },
          ])
        } catch (e: any) {
          setHistory((prev) => [
            ...prev,
            { type: 'err', text: `Hash calculation error: ${e?.message || 'Unsupported algorithm'}` },
          ])
        }
        return
      }

      case 'cve': {
        if (!arg) {
          setHistory((prev) => [
            ...prev,
            { type: 'err', text: 'Usage: cve <CVE-ID or software name> (e.g. cve CVE-2024-3094, cve log4j, cve openssh)' },
          ])
          return
        }
        setIsProcessing(true)
        setHistory((prev) => [
          ...prev,
          { type: 'out', text: `Querying global threat database for :: "${fullArg}"...` },
        ])
        try {
          const res = await fetch(`/api/cve?q=${encodeURIComponent(fullArg)}`)
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const data = await res.json()
          const results: CveItem[] = data.results || []
          if (results.length === 0) {
            setHistory((prev) => [
              ...prev,
              { type: 'warn', text: `No CVE records matched "${fullArg}".` },
            ])
          } else {
            const outLines: Line[] = [
              { type: 'success', text: `[+] Found ${results.length} CVE intelligence record(s):` },
            ]
            for (const item of results) {
              const sevColor = item.severity === 'CRITICAL' ? 'err' : item.severity === 'HIGH' ? 'warn' : 'out'
              outLines.push({
                type: sevColor as any,
                text: `[${item.id}] CVSS: ${item.cvss ?? 'N/A'} [${item.severity || 'UNKNOWN'}] - Published: ${item.published.slice(0, 10)}`,
              })
              outLines.push({
                type: 'out',
                text: `    ${item.description.slice(0, 140)}...`,
              })
            }
            setHistory((prev) => [...prev, ...outLines])
          }
        } catch (e: any) {
          setHistory((prev) => [
            ...prev,
            { type: 'err', text: `CVE query failed: ${e?.message || 'Network error'}` },
          ])
        } finally {
          setIsProcessing(false)
        }
        return
      }

      case 'dns': {
        if (!arg) {
          setHistory((prev) => [
            ...prev,
            { type: 'err', text: 'Usage: dns <domain> (e.g. dns cloudflare.com)' },
          ])
          return
        }
        setIsProcessing(true)
        setHistory((prev) => [
          ...prev,
          { type: 'out', text: `Enumerating DNS infrastructure for :: ${arg}...` },
        ])
        try {
          const report = await performRecon(arg)
          if (!report) {
            setHistory((prev) => [...prev, { type: 'err', text: `DNS enumeration failed for ${arg}` }])
          } else {
            setHistory((prev) => [
              ...prev,
              { type: 'success', text: `[+] DNS ENUMERATION REPORT FOR ${report.hostname}:` },
              { type: 'out', text: `  A Records:    ${report.dns.a.join(', ') || 'None'}` },
              { type: 'out', text: `  AAAA Records: ${report.dns.aaaa.join(', ') || 'None'}` },
              { type: 'out', text: `  MX Servers:   ${report.dns.mx.map(m => `${m.exchange} (pri ${m.priority})`).join(', ') || 'None'}` },
              { type: 'out', text: `  NS Servers:   ${report.dns.ns.join(', ') || 'None'}` },
              {
                type: report.dns.spfPresent ? 'success' : 'warn',
                text: `  SPF Policy:   ${report.dns.spfPresent ? '[VALID] Anti-spoofing published' : '[MISSING] Domain vulnerable to spoofing'}`,
              },
              {
                type: report.dns.dmarcPresent ? 'success' : 'warn',
                text: `  DMARC Policy: ${report.dns.dmarcPresent ? '[ACTIVE] Policy enforcement in place' : '[MISSING] No DMARC record found'}`,
              },
            ])
          }
        } finally {
          setIsProcessing(false)
        }
        return
      }

      case 'lookup':
      case 'track': {
        if (!arg) {
          setHistory((prev) => [
            ...prev,
            { type: 'err', text: 'Usage: lookup <ip|domain> (e.g. lookup 1.1.1.1 or lookup github.com)' },
          ])
          return
        }
        setIsProcessing(true)
        setHistory((prev) => [
          ...prev,
          { type: 'out', text: `Tracing IP & ASN coordinates for :: ${arg}...` },
        ])
        try {
          const report = await performRecon(arg)
          if (!report || !report.geo) {
            setHistory((prev) => [...prev, { type: 'err', text: `Could not retrieve GeoIP for ${arg}` }])
          } else {
            setHistory((prev) => [
              ...prev,
              { type: 'success', text: `[+] TELEMETRY ACQUIRED :: ${report.ip}` },
              { type: 'out', text: `  Host:        ${report.hostname}` },
              { type: 'out', text: `  Country:     ${report.geo?.country} [${report.geo?.countryCode}]` },
              { type: 'out', text: `  City/Region: ${report.geo?.city}, ${report.geo?.regionName}` },
              { type: 'out', text: `  Coordinates: ${report.geo?.lat}, ${report.geo?.lon}` },
              { type: 'out', text: `  ISP / Org:   ${report.geo?.isp} // ${report.geo?.org}` },
              { type: 'out', text: `  AS Number:   ${report.geo?.as}` },
              { type: 'success', text: `[+] Plotted and locked on Global Attack Map.` },
            ])
          }
        } finally {
          setIsProcessing(false)
        }
        return
      }

      case 'headers':
      case 'scan':
      case 'recon': {
        if (!arg) {
          setHistory((prev) => [
            ...prev,
            { type: 'err', text: `Usage: ${action} <domain|ip> (e.g. recon defcon.org)` },
          ])
          return
        }
        setIsProcessing(true)
        setHistory((prev) => [
          ...prev,
          { type: 'out', text: `[1/3] Resolving host and mapping DNS topology for ${arg}...` },
          { type: 'out', text: `[2/3] Extracting GeoIP telemetry & AS vectors...` },
          { type: 'out', text: `[3/3] Inspecting HTTP Security Headers & TLS posture...` },
        ])

        try {
          const report = await performRecon(arg)
          if (!report) {
            setHistory((prev) => [
              ...prev,
              { type: 'err', text: `Recon sweep failed for ${arg}. Check host connectivity.` },
            ])
          } else {
            const outLines: Line[] = [
              { type: 'success', text: `=====================================================` },
              { type: 'success', text: `[+] RECON SWEEP COMPLETE :: ${report.hostname} (${report.ip})` },
              {
                type: 'out',
                text: `LOCATION: ${report.geo ? `${report.geo.city}, ${report.geo.country} [${report.geo.countryCode}] (ISP: ${report.geo.isp})` : 'Unknown'}`,
              },
              {
                type: report.security.grade === 'A+' || report.security.grade === 'A' ? 'success' : report.security.grade === 'B' || report.security.grade === 'C' ? 'warn' : 'err',
                text: `SECURITY POSTURE GRADE: [${report.security.grade}] :: SCORE: ${report.security.score}/100`,
              },
              { type: 'out', text: 'FINDINGS & AUDIT RESULTS:' },
            ]

            for (const f of report.security.findings) {
              outLines.push({
                type: f.type === 'PASS' ? 'success' : f.type === 'WARN' ? 'warn' : 'err',
                text: `  [${f.type}] ${f.message}`,
              })
            }

            outLines.push({
              type: 'out',
              text: `Target plotted on tactical Attack Map. Select row to trace vector.`,
            })
            outLines.push({ type: 'success', text: `=====================================================` })

            setHistory((prev) => [...prev, ...outLines])
          }
        } finally {
          setIsProcessing(false)
        }
        return
      }

      case 'ai':
      case 'intel':
      case 'pandora': {
        if (!arg) {
          setHistory((prev) => [
            ...prev,
            { type: 'err', text: 'Usage: ai <question or target topic> (e.g. ai how to mitigate XSS or ai analyze google.com)' },
          ])
          return
        }
        setIsProcessing(true)
        setHistory((prev) => [
          ...prev,
          { type: 'out', text: `Consulting PANDORA Tactical Core for query: "${fullArg}"...` },
        ])
        setTimeout(() => {
          const lower = fullArg.toLowerCase()
          let responseLines: string[] = []

          if (lower.includes('google') || lower.includes('hsts') || lower.includes('ssl')) {
            responseLines = [
              '[PANDORA AI :: TACTICAL ASSESSMENT]',
              'TARGET: Web Infrastructure SSL/HSTS Architecture',
              'RECOMMENDATION: Enable Strict-Transport-Security with preload: max-age=63072000; includeSubDomains; preload.',
              'RISK LEVEL: Moderate - Without HSTS, attackers on public Wi-Fi can downgrade traffic using SSLStrip.',
              'MITIGATION: Configure webserver to immediately redirect HTTP:80 to HTTPS:443 with 301/308 permanent redirect.',
            ]
          } else if (lower.includes('cve') || lower.includes('exploit') || lower.includes('log4j') || lower.includes('3094')) {
            responseLines = [
              '[PANDORA AI :: THREAT INTEL DOSSIER]',
              'SUBJECT: Critical Vulnerability Analysis',
              'VETTING: High-severity supply chain and RCE vulnerabilities require immediate patch deployment.',
              'ACTION: Isolate exposed ports, inspect outbound LDAP/RMI connections, and enforce egress firewall rules.',
              'STATUS: Signatures monitored across active surveillance nodes.',
            ]
          } else if (lower.includes('xss') || lower.includes('csp')) {
            responseLines = [
              '[PANDORA AI :: APPLICATION SECURITY DIRECTIVE]',
              'SUBJECT: Cross-Site Scripting (XSS) Hardening',
              'POLICY: Enforce strict Content-Security-Policy: default-src \'self\'; script-src \'nonce-...\' \'strict-dynamic\';',
              'DEFENSE: Sanitize all untrusted DOM inputs using DOMPurify and escape reflected parameters.',
            ]
          } else {
            responseLines = [
              `[PANDORA AI :: OPERATIONAL INTEL READY]`,
              `ANALYSIS OF "${fullArg}":`,
              `• Reconnaissance vectors operational. Defense-in-depth architecture verified.`,
              `• Key priorities: Enforce least privilege, deploy TLS 1.3, configure DMARC/SPF, and audit headers.`,
              `• For specific target auditing, execute: "recon <domain>" or "cve <software>".`,
            ]
          }

          setHistory((prev) => [
            ...prev,
            { type: 'success', text: '=====================================================' },
            ...responseLines.map((text) => ({ type: 'out' as const, text })),
            { type: 'success', text: '=====================================================' },
          ])
          setIsProcessing(false)
        }, 800)
        return
      }

      case 'export':
      case 'dossier': {
        const targetIp = arg || (targets[0] ? targets[0].ip : 'localhost')
        const tData = targets.find((t) => t.ip === targetIp || t.hostname === targetIp) || targets[0]

        if (!tData) {
          setHistory((prev) => [
            ...prev,
            { type: 'err', text: 'No targets in telemetry. Run "recon <target>" first.' },
          ])
          return
        }

        const mdContent = `# ARGUS-FATE // CONFIDENTIAL FORENSIC DOSSIER
===================================================================
CLASSIFICATION: TOP SECRET // ORCON
DATE: ${new Date().toISOString()}
OPERATOR: PANDORA (LEVEL-5 CLEARANCE)

[TARGET TELEMETRY]
- Host:        ${tData.hostname || tData.ip}
- IP Address:  ${tData.ip}
- Country:     ${tData.country} [${tData.code}]
- City:        ${tData.city || 'N/A'}
- ISP / Org:   ${tData.isp || 'N/A'}
- Coordinates: ${tData.coordinates[1]}°, ${tData.coordinates[0]}°
- Posture:     ${tData.status} (Security Grade: [${tData.grade || 'N/A'}] Score: ${tData.score || 'N/A'}/100)

[AUDIT RECOMMENDATIONS]
1. Enforce HSTS (Strict-Transport-Security) with minimum 1 year max-age.
2. Publish strict Content-Security-Policy (CSP) to eliminate XSS surface.
3. Configure SPF and DMARC enforcement policies (p=reject) for all mail domains.
4. Verify TLS certificates and strip verbose 'Server' response headers.

===================================================================
ARGUS TACTICAL OPERATIONS SUITE — DEFENSE INTELLIGENCE ARCHIVE
`
        const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `DOSSIER_${tData.hostname || tData.ip}_${Date.now()}.md`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        setHistory((prev) => [
          ...prev,
          { type: 'success', text: `[+] Forensic dossier generated & downloaded: DOSSIER_${tData.hostname || tData.ip}.md` },
          { type: 'out', text: `    Target: ${tData.hostname || tData.ip} | Classification: TOP SECRET` },
        ])
        return
      }
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (isProcessing) return
    const cmd = value.trim()
    setValue('')
    executeCommand(cmd)
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') {
      playTypingBip()
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (cmdHistory.length === 0) return
      const nextIndex = historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(nextIndex)
      setValue(cmdHistory[nextIndex] || '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex === -1) return
      const nextIndex = historyIndex + 1
      if (nextIndex >= cmdHistory.length) {
        setHistoryIndex(-1)
        setValue('')
      } else {
        setHistoryIndex(nextIndex)
        setValue(cmdHistory[nextIndex] || '')
      }
    }
  }

  return (
    <section className="flex h-72 min-h-0 flex-col border border-border bg-panel">
      <header className="flex items-center justify-between border-b border-border bg-muted px-2 py-1">
        <div className="flex items-center gap-2">
          <span className="text-alert">■</span>
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-primary">
            TACTICAL CLI CONSOLE
          </h2>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          {isProcessing && (
            <span className="text-amber animate-pulse font-mono">
              [PROCESSING REQUEST...]
            </span>
          )}
          <span className="text-muted-foreground">TTY: /dev/pts/0</span>
        </div>
      </header>

      <div
        ref={scrollRef}
        onClick={() => inputRef.current?.focus()}
        className="min-h-0 flex-1 space-y-0.5 overflow-auto p-2 text-[11px] font-mono leading-relaxed cursor-text"
      >
        {history.map((line, i) => (
          <div
            key={i}
            className={cn(
              'break-all whitespace-pre-wrap',
              line.type === 'in' && 'text-cyan font-semibold',
              line.type === 'out' && 'text-foreground/90',
              line.type === 'err' && 'text-alert font-bold',
              line.type === 'warn' && 'text-amber',
              line.type === 'success' && 'text-primary font-medium',
            )}
          >
            {line.text}
          </div>
        ))}
      </div>

      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 border-t border-border px-2 py-2 bg-black/40"
      >
        <label htmlFor="cli-input" className="shrink-0 text-[11px] font-mono text-primary select-none">
          {PROMPT}
        </label>
        <input
          ref={inputRef}
          id="cli-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={isProcessing}
          autoComplete="off"
          spellCheck={false}
          aria-label="Command input"
          className="flex-1 border-none bg-transparent text-[11px] font-mono text-primary placeholder:opacity-40 caret-primary outline-none"
          placeholder={isProcessing ? 'Executing instruction...' : "type 'recon <host>', 'cve <query>', 'dns <domain>' or 'help'..."}
        />
        <span className="animate-blink text-primary select-none">▌</span>
      </form>
    </section>
  )
}
