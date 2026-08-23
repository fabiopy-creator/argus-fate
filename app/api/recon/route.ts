import { NextRequest, NextResponse } from 'next/server'
import dns from 'node:dns/promises'

export interface ReconReport {
  target: string
  ip: string
  hostname: string
  geo: {
    status: string
    country: string
    countryCode: string
    regionName: string
    city: string
    zip: string
    lat: number
    lon: number
    timezone: string
    isp: string
    org: string
    as: string
  } | null
  dns: {
    a: string[]
    aaaa: string[]
    mx: Array<{ exchange: string; priority: number }>
    txt: string[][]
    ns: string[]
    spfPresent: boolean
    dmarcPresent: boolean
  }
  security: {
    score: number // 0-100
    grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'
    headers: Record<string, string | null>
    findings: Array<{
      type: 'PASS' | 'WARN' | 'FAIL'
      message: string
    }>
    serverBanner?: string
    protocol?: string
  }
}

function cleanTarget(input: string): string {
  let cleaned = input.trim()
  cleaned = cleaned.replace(/^https?:\/\//i, '')
  cleaned = cleaned.split('/')[0]
  cleaned = cleaned.split(':')[0]
  return cleaned
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const rawTarget = body?.target
    if (!rawTarget || typeof rawTarget !== 'string') {
      return NextResponse.json({ error: 'Target is required' }, { status: 400 })
    }

    const host = cleanTarget(rawTarget)
    if (!host) {
      return NextResponse.json({ error: 'Invalid target host' }, { status: 400 })
    }

    // 1. DNS Resolution
    let resolvedIp = host
    const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(host) || host.includes(':')
    
    const dnsResults = {
      a: [] as string[],
      aaaa: [] as string[],
      mx: [] as Array<{ exchange: string; priority: number }>,
      txt: [] as string[][],
      ns: [] as string[],
      spfPresent: false,
      dmarcPresent: false,
    }

    if (!isIp) {
      const [aRes, aaaaRes, mxRes, txtRes, nsRes] = await Promise.allSettled([
        dns.resolve4(host),
        dns.resolve6(host),
        dns.resolveMx(host),
        dns.resolveTxt(host),
        dns.resolveNs(host),
      ])

      if (aRes.status === 'fulfilled') dnsResults.a = aRes.value
      if (aaaaRes.status === 'fulfilled') dnsResults.aaaa = aaaaRes.value
      if (mxRes.status === 'fulfilled') dnsResults.mx = mxRes.value
      if (txtRes.status === 'fulfilled') {
        dnsResults.txt = txtRes.value
        dnsResults.spfPresent = txtRes.value.some((entry) =>
          entry.join(' ').toLowerCase().includes('v=spf1')
        )
      }
      if (nsRes.status === 'fulfilled') dnsResults.ns = nsRes.value

      // Check DMARC
      try {
        const dmarcTxt = await dns.resolveTxt(`_dmarc.${host}`)
        dnsResults.dmarcPresent = dmarcTxt.some((entry) =>
          entry.join(' ').toLowerCase().includes('v=dmarc1')
        )
      } catch {
        dnsResults.dmarcPresent = false
      }

      if (dnsResults.a.length > 0) {
        resolvedIp = dnsResults.a[0]
      }
    } else {
      dnsResults.a = [host]
    }

    // 2. GeoIP & ASN Lookup
    let geoData = null
    try {
      const geoRes = await fetch(
        `http://ip-api.com/json/${encodeURIComponent(resolvedIp)}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`,
        { next: { revalidate: 300 } }
      )
      if (geoRes.ok) {
        const json = await geoRes.json()
        if (json.status === 'success') {
          geoData = json
        }
      }
    } catch {
      // Fallback if rate limited or network issue
    }

    // 3. HTTP Security Headers Inspection
    const targetUrl = `https://${host}`
    const findings: ReconReport['security']['findings'] = []
    let score = 100
    const capturedHeaders: Record<string, string | null> = {
      'strict-transport-security': null,
      'content-security-policy': null,
      'x-frame-options': null,
      'x-content-type-options': null,
      'referrer-policy': null,
      'permissions-policy': null,
      'server': null,
      'x-powered-by': null,
    }
    let serverBanner: string | undefined
    let protocol = 'https'

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 6000)

      const httpRes = await fetch(targetUrl, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'ArgusFate-SecurityScanner/2.0 (+https://github.com/argus-fate)',
        },
      })
      clearTimeout(timeoutId)

      // Collect headers
      for (const h of Object.keys(capturedHeaders)) {
        capturedHeaders[h] = httpRes.headers.get(h)
      }
      serverBanner = capturedHeaders['server'] || undefined

      // Analyze Security Posture
      if (capturedHeaders['strict-transport-security']) {
        findings.push({ type: 'PASS', message: 'HSTS (Strict-Transport-Security) enforced' })
      } else {
        score -= 20
        findings.push({ type: 'FAIL', message: 'HSTS is missing - susceptible to SSL strip attacks' })
      }

      if (capturedHeaders['content-security-policy']) {
        findings.push({ type: 'PASS', message: 'Content-Security-Policy (CSP) configured' })
      } else {
        score -= 20
        findings.push({ type: 'WARN', message: 'CSP is missing - increased XSS injection surface' })
      }

      if (capturedHeaders['x-frame-options']) {
        findings.push({ type: 'PASS', message: `X-Frame-Options set: ${capturedHeaders['x-frame-options']}` })
      } else {
        score -= 15
        findings.push({ type: 'WARN', message: 'X-Frame-Options missing - potential clickjacking risk' })
      }

      if (capturedHeaders['x-content-type-options'] === 'nosniff') {
        findings.push({ type: 'PASS', message: 'X-Content-Type-Options set to nosniff' })
      } else {
        score -= 10
        findings.push({ type: 'WARN', message: 'MIME-sniffing protection missing' })
      }

      if (capturedHeaders['server']) {
        score -= 5
        findings.push({ type: 'WARN', message: `Server banner exposed: ${capturedHeaders['server']}` })
      }

      if (capturedHeaders['x-powered-by']) {
        score -= 10
        findings.push({ type: 'WARN', message: `Technology stack leaked in X-Powered-By: ${capturedHeaders['x-powered-by']}` })
      }

    } catch (e: any) {
      findings.push({
        type: 'WARN',
        message: `HTTP endpoint scan skipped or unreachable (${e?.name || 'timeout'})`,
      })
      score -= 20
    }

    // DNS Security findings
    if (!isIp) {
      if (dnsResults.spfPresent) {
        findings.push({ type: 'PASS', message: 'SPF record published (anti-spoofing)' })
      } else {
        score -= 10
        findings.push({ type: 'WARN', message: 'No SPF record found - domain may be spoofable in email' })
      }

      if (dnsResults.dmarcPresent) {
        findings.push({ type: 'PASS', message: 'DMARC policy active' })
      } else {
        score -= 10
        findings.push({ type: 'WARN', message: 'No DMARC policy found for email domain' })
      }
    }

    score = Math.max(0, Math.min(100, score))
    let grade: ReconReport['security']['grade'] = 'F'
    if (score >= 90) grade = 'A+'
    else if (score >= 80) grade = 'A'
    else if (score >= 65) grade = 'B'
    else if (score >= 50) grade = 'C'
    else if (score >= 35) grade = 'D'

    const report: ReconReport = {
      target: rawTarget,
      hostname: host,
      ip: resolvedIp,
      geo: geoData,
      dns: dnsResults,
      security: {
        score,
        grade,
        headers: capturedHeaders,
        findings,
        serverBanner,
        protocol,
      },
    }

    return NextResponse.json(report)
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to perform recon sweep' },
      { status: 500 }
    )
  }
}
