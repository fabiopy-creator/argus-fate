'use client'

import { useState } from 'react'
import { X, Hash, Globe, Dna, ShieldCheck, Code2, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReconStore } from '@/lib/recon-store'
import type { CveItem } from '@/app/api/cve/route'
import type { ReconReport } from '@/app/api/recon/route'

/* ========== HASH TOOL ========== */
async function computeHash(algo: string, text: string): Promise<string> {
  if (algo === 'md5') {
    return `[md5-client-sim] ${Array.from(new TextEncoder().encode(text))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 32)}`
  }
  const map: Record<string, string> = {
    sha1: 'SHA-1', sha256: 'SHA-256', sha512: 'SHA-512', sha384: 'SHA-384',
  }
  const algoStr = map[algo.toLowerCase()] || 'SHA-256'
  const buf = await crypto.subtle.digest(algoStr, new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function HashModule() {
  const [algo, setAlgo] = useState('sha256')
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCompute() {
    if (!input.trim()) return
    setLoading(true)
    try {
      const hash = await computeHash(algo, input.trim())
      setResult(hash)
    } finally {
      setLoading(false)
    }
  }

  const algos = ['sha256', 'sha512', 'sha1', 'sha384', 'md5']

  return (
    <div className="space-y-3 font-mono text-[11px]">
      <div className="text-muted-foreground border-b border-border pb-2">
        Compute cryptographic hashes client-side via Web Crypto API. Zero data leaves your browser.
      </div>
      <div className="flex gap-2 flex-wrap">
        {algos.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAlgo(a)}
            className={cn(
              'border px-2 py-0.5 uppercase text-[10px] tracking-wider transition-colors cursor-pointer',
              algo === a
                ? 'border-primary bg-primary/15 text-primary'
                : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
            )}
          >
            {a}
          </button>
        ))}
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={3}
        placeholder="Enter text or payload to hash..."
        className="w-full resize-none border border-border bg-black/60 px-2 py-1.5 text-primary placeholder:opacity-40 outline-none transition-colors"
      />
      <button
        type="button"
        onClick={handleCompute}
        disabled={loading || !input.trim()}
        className="border border-primary bg-primary/10 px-3 py-1 text-primary uppercase tracking-wider hover:bg-primary hover:text-black transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
      >
        {loading ? 'COMPUTING...' : `COMPUTE ${algo.toUpperCase()}`}
      </button>
      {result && (
        <div className="border border-primary/40 bg-primary/5 p-2 break-all">
          <div className="text-[9px] uppercase text-muted-foreground mb-1">{algo.toUpperCase()} DIGEST OUTPUT:</div>
          <div className="text-primary font-bold tracking-wider">{result}</div>
        </div>
      )}
    </div>
  )
}

/* ========== RECON / WHOIS MODULE ========== */
function ReconModule() {
  const { performRecon, isScanning } = useReconStore()
  const [target, setTarget] = useState('')
  const [report, setReport] = useState<ReconReport | null>(null)

  async function handleRecon(e: React.FormEvent) {
    e.preventDefault()
    if (!target.trim() || isScanning) return
    const result = await performRecon(target.trim())
    if (result) setReport(result)
  }

  return (
    <div className="space-y-3 font-mono text-[11px]">
      <div className="text-muted-foreground border-b border-border pb-2">
        Full-spectrum OSINT: DNS enumeration, GeoIP telemetry & HTTP Security Headers audit. Real data, no simulations.
      </div>
      <form onSubmit={handleRecon} className="flex gap-2">
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="domain or IP (e.g. cloudflare.com, 1.1.1.1)"
          disabled={isScanning}
          className="flex-1 border border-border bg-black/60 px-2 py-1.5 text-primary placeholder:opacity-40 outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={isScanning || !target.trim()}
          className="border border-alert bg-alert/10 px-3 py-1 text-alert uppercase tracking-wider hover:bg-alert hover:text-black transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none shrink-0"
        >
          {isScanning ? 'SCANNING...' : 'SWEEP'}
        </button>
      </form>

      {report && (
        <div className="space-y-2 border border-border p-2 bg-black/40 max-h-72 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-1">
            <span className="text-primary font-bold">{report.hostname} ({report.ip})</span>
            <span className={cn(
              'font-bold',
              report.security.grade === 'A+' || report.security.grade === 'A' ? 'text-primary' :
              report.security.grade === 'B' || report.security.grade === 'C' ? 'text-amber' : 'text-alert'
            )}>
              GRADE: [{report.security.grade}] {report.security.score}/100
            </span>
          </div>

          {/* GeoIP */}
          {report.geo && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px]">
              <span className="text-muted-foreground">Country</span><span>{report.geo.country} [{report.geo.countryCode}]</span>
              <span className="text-muted-foreground">City</span><span>{report.geo.city}, {report.geo.regionName}</span>
              <span className="text-muted-foreground">Coords</span><span>{report.geo.lat.toFixed(3)}, {report.geo.lon.toFixed(3)}</span>
              <span className="text-muted-foreground">ISP</span><span className="truncate">{report.geo.isp}</span>
              <span className="text-muted-foreground">AS Number</span><span className="truncate">{report.geo.as}</span>
              <span className="text-muted-foreground">Timezone</span><span>{report.geo.timezone}</span>
            </div>
          )}

          {/* DNS */}
          <div className="border-t border-border pt-1 space-y-0.5">
            <div className="text-[9px] uppercase text-cyan mb-1">DNS TELEMETRY</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px]">
              <span className="text-muted-foreground">A Records</span><span className="truncate">{report.dns.a.join(', ') || '—'}</span>
              <span className="text-muted-foreground">NS</span><span className="truncate">{report.dns.ns.slice(0, 2).join(', ') || '—'}</span>
              <span className="text-muted-foreground">MX</span><span className="truncate">{report.dns.mx.slice(0, 2).map(m => m.exchange).join(', ') || '—'}</span>
              <span className="text-muted-foreground">SPF</span>
              <span className={report.dns.spfPresent ? 'text-primary' : 'text-alert'}>{report.dns.spfPresent ? '✔ Published' : '✘ Missing'}</span>
              <span className="text-muted-foreground">DMARC</span>
              <span className={report.dns.dmarcPresent ? 'text-primary' : 'text-alert'}>{report.dns.dmarcPresent ? '✔ Active' : '✘ Missing'}</span>
            </div>
          </div>

          {/* Security Findings */}
          <div className="border-t border-border pt-1 space-y-0.5">
            <div className="text-[9px] uppercase text-amber mb-1">SECURITY FINDINGS</div>
            {report.security.findings.map((f, i) => (
              <div key={i} className={cn(
                'text-[10px] flex gap-1.5',
                f.type === 'PASS' ? 'text-primary' : f.type === 'WARN' ? 'text-amber' : 'text-alert'
              )}>
                <span className="shrink-0 font-bold">[{f.type}]</span>
                <span>{f.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ========== CVE MODULE ========== */
function CveModule() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CveItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim() || loading) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/cve?q=${encodeURIComponent(query.trim())}`)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setResults(data.results || [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const SEV_COLOR: Record<string, string> = {
    CRITICAL: 'text-alert border-alert',
    HIGH: 'text-amber border-amber',
    MEDIUM: 'text-cyan border-cyan',
    LOW: 'text-primary border-primary',
  }

  return (
    <div className="space-y-3 font-mono text-[11px]">
      <div className="text-muted-foreground border-b border-border pb-2">
        Query live CVE / NVD threat intelligence database. Search by CVE-ID, software name, or vulnerability type.
      </div>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="CVE-2024-3094, log4j, openssh, nginx..."
          disabled={loading}
          className="flex-1 border border-border bg-black/60 px-2 py-1.5 text-primary placeholder:opacity-40 outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="border border-amber bg-amber/10 px-3 py-1 text-amber uppercase tracking-wider hover:bg-amber hover:text-black transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none shrink-0"
        >
          {loading ? 'QUERYING...' : 'INTEL QUERY'}
        </button>
      </form>
      {loading && (
        <div className="text-amber animate-pulse text-[10px]">
          ● Querying CVE intelligence database...
        </div>
      )}
      {searched && !loading && results.length === 0 && (
        <div className="text-muted-foreground">No CVE records found for "{query}".</div>
      )}
      {results.length > 0 && (
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {results.map((item) => (
            <div key={item.id} className="border border-border bg-black/40 p-2 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-primary">{item.id}</span>
                <div className="flex items-center gap-2">
                  {item.severity && (
                    <span className={cn('border px-1.5 text-[9px] uppercase tracking-wider', SEV_COLOR[item.severity] || 'text-muted-foreground border-border')}>
                      {item.severity}
                    </span>
                  )}
                  {item.cvss !== undefined && (
                    <span className="text-[10px] text-muted-foreground">CVSS: <strong>{item.cvss.toFixed(1)}</strong></span>
                  )}
                </div>
              </div>
              <div className="text-muted-foreground text-[10px] leading-relaxed">{item.description}</div>
              <div className="flex items-center gap-3 text-[9px] text-muted-foreground/70">
                <span>Published: {item.published.slice(0, 10)}</span>
                {item.references?.[0] && (
                  <a
                    href={item.references[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-0.5 text-cyan hover:underline"
                  >
                    <ExternalLink className="size-2.5" />
                    NVD Reference
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ========== PAYLOAD / ENCODER MODULE ========== */
function PayloadModule() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'b64enc' | 'b64dec' | 'hexenc' | 'hexdec' | 'urlencode' | 'urldecode'>('b64enc')

  function process() {
    if (!input.trim()) return
    try {
      let result = ''
      switch (mode) {
        case 'b64enc': result = btoa(unescape(encodeURIComponent(input))); break
        case 'b64dec': result = decodeURIComponent(escape(atob(input))); break
        case 'hexenc': result = Array.from(new TextEncoder().encode(input)).map(b => b.toString(16).padStart(2, '0')).join(' '); break
        case 'hexdec': {
          const bytes = input.trim().split(/\s+/).map(h => parseInt(h, 16))
          result = new TextDecoder().decode(new Uint8Array(bytes))
          break
        }
        case 'urlencode': result = encodeURIComponent(input); break
        case 'urldecode': result = decodeURIComponent(input); break
      }
      setOutput(result)
    } catch {
      setOutput('[ERROR] Invalid input for selected encoding operation.')
    }
  }

  const modes: Array<{ id: typeof mode; label: string }> = [
    { id: 'b64enc', label: 'Base64 Encode' },
    { id: 'b64dec', label: 'Base64 Decode' },
    { id: 'hexenc', label: 'Hex Encode' },
    { id: 'hexdec', label: 'Hex Decode' },
    { id: 'urlencode', label: 'URL Encode' },
    { id: 'urldecode', label: 'URL Decode' },
  ]

  return (
    <div className="space-y-3 font-mono text-[11px]">
      <div className="text-muted-foreground border-b border-border pb-2">
        Client-side encoder/decoder for payload crafting, CTF challenges, and WAF bypass testing.
      </div>
      <div className="flex gap-2 flex-wrap">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={cn(
              'border px-2 py-0.5 text-[9px] uppercase tracking-wider transition-colors cursor-pointer',
              mode === m.id
                ? 'border-cyan bg-cyan/15 text-cyan'
                : 'border-border text-muted-foreground hover:border-cyan hover:text-cyan'
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={3}
        placeholder="Input payload or encoded string..."
        className="w-full resize-none border border-border bg-black/60 px-2 py-1.5 text-primary placeholder:opacity-40 outline-none transition-colors"
      />
      <button
        type="button"
        onClick={process}
        disabled={!input.trim()}
        className="border border-cyan bg-cyan/10 px-3 py-1 text-cyan uppercase tracking-wider hover:bg-cyan hover:text-black transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
      >
        EXECUTE TRANSFORM
      </button>
      {output && (
        <div className="border border-cyan/40 bg-cyan/5 p-2 break-all">
          <div className="text-[9px] uppercase text-muted-foreground mb-1">OUTPUT:</div>
          <div className="text-cyan">{output}</div>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(output)}
            className="mt-1 text-[9px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
          >
            [COPY TO CLIPBOARD]
          </button>
        </div>
      )}
    </div>
  )
}

/* ========== MODULE DEFINITIONS ========== */
interface ModuleModal {
  id: string
  title: string
  icon: React.ReactNode
  component: React.ReactNode
  accent: string
}

const MODULE_MODALS: ModuleModal[] = [
  { id: '11', title: 'HASH TOOLKIT', icon: <Hash className="size-3.5" />, component: <HashModule />, accent: 'text-primary border-primary' },
  { id: '07', title: 'WHOIS & IP RECON', icon: <Globe className="size-3.5" />, component: <ReconModule />, accent: 'text-alert border-alert' },
  { id: '08', title: 'DNS INTELLIGENCE', icon: <Dna className="size-3.5" />, component: <ReconModule />, accent: 'text-cyan border-cyan' },
  { id: '09', title: 'CVE & THREAT INTEL', icon: <ShieldCheck className="size-3.5" />, component: <CveModule />, accent: 'text-amber border-amber' },
  { id: '18', title: 'PAYLOAD FORGE / ENCODER', icon: <Code2 className="size-3.5" />, component: <PayloadModule />, accent: 'text-cyan border-cyan' },
]

/* ========== EXPORT: Trigger & Modal ========== */
export function getModuleModal(id: string): ModuleModal | undefined {
  return MODULE_MODALS.find((m) => m.id === id)
}

export function ModuleModal() {
  const { activeModuleModal, setActiveModuleModal } = useReconStore()
  if (!activeModuleModal) return null

  const modal = getModuleModal(activeModuleModal)
  if (!modal) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        onClick={() => setActiveModuleModal(null)}
      />
      {/* Panel */}
      <div className="fixed inset-x-4 top-1/2 z-50 max-w-2xl mx-auto -translate-y-1/2 border border-border bg-panel shadow-2xl shadow-black/80">
        {/* Header */}
        <div className={cn('flex items-center justify-between border-b border-border bg-muted px-3 py-2', modal.accent.split(' ')[0])}>
          <div className="flex items-center gap-2">
            {modal.icon}
            <span className="text-[11px] font-bold uppercase tracking-widest">{modal.title}</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveModuleModal(null)}
            className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
        {/* Body */}
        <div className="p-3 max-h-[70vh] overflow-y-auto">
          {modal.component}
        </div>
      </div>
    </>
  )
}
