export type Tag = 'Hot Results' | 'Fixed' | 'New' | 'Beta' | 'Stable' | null

export interface ModuleItem {
  id: string
  name: string
  tag: Tag
}

export const MODULES: ModuleItem[] = [
  { id: '01', name: 'DUMP', tag: 'Hot Results' },
  { id: '02', name: 'DDOS', tag: 'Stable' },
  { id: '03', name: 'ADMIN FINDER', tag: null },
  { id: '04', name: 'CCTV HIJACKER', tag: 'Hot Results' },
  { id: '05', name: 'PORT SCANNER', tag: 'Fixed' },
  { id: '06', name: 'SUBDOMAIN ENUM', tag: null },
  { id: '07', name: 'WHOIS LOOKUP', tag: null },
  { id: '08', name: 'DNS RESOLVER', tag: 'Stable' },
  { id: '09', name: 'SQL PROBE', tag: 'Beta' },
  { id: '10', name: 'XSS SCANNER', tag: null },
  { id: '11', name: 'HASH CRACKER', tag: 'Fixed' },
  { id: '12', name: 'PROXY CHAIN', tag: null },
  { id: '13', name: 'PACKET SNIFFER', tag: 'New' },
  { id: '14', name: 'GEO TRACKER', tag: null },
  { id: '15', name: 'MAC SPOOFER', tag: null },
  { id: '16', name: 'WIFI CRACKER', tag: 'Beta' },
  { id: '17', name: 'PHISH FORGE', tag: null },
  { id: '18', name: 'PAYLOAD GEN', tag: 'Hot Results' },
  { id: '19', name: 'RECON SWEEP', tag: 'Stable' },
  { id: '20', name: 'EXFIL TUNNEL', tag: 'New' },
]

export type LogLevel = 'INFO' | 'SCAN' | 'OPEN' | 'ALERT' | 'EXPLOIT'

export interface LogEntry {
  time: string
  level: LogLevel
  message: string
}

export const INITIAL_LOGS: LogEntry[] = [
  { time: '04:12:08', level: 'INFO', message: 'session initialized :: node ARGUS-07' },
  { time: '04:12:11', level: 'SCAN', message: 'sweeping 192.168.44.0/24 :: 254 hosts' },
  { time: '04:12:14', level: 'OPEN', message: '10.0.3.19:22 ssh openssh_8.9 detected' },
  { time: '04:12:19', level: 'OPEN', message: '10.0.3.19:443 nginx/1.24 tls1.3' },
  { time: '04:12:23', level: 'ALERT', message: 'intrusion attempt blocked :: 45.221.9.10' },
  { time: '04:12:27', level: 'EXPLOIT', message: 'CVE-2024-3094 payload staged :: target 04' },
  { time: '04:12:31', level: 'SCAN', message: 'enumerating subdomains :: fatecorp.net' },
  { time: '04:12:35', level: 'INFO', message: 'proxy chain rotated :: 6 hops [TOR]' },
  { time: '04:12:40', level: 'ALERT', message: 'honeypot signature matched :: aborting' },
  { time: '04:12:44', level: 'OPEN', message: '198.51.100.7:3389 rdp exposed' },
]

export const LOG_SNIPPETS: Omit<LogEntry, 'time'>[] = [
  { level: 'SCAN', message: 'port sweep :: 172.16.0.0/16 in progress' },
  { level: 'OPEN', message: 'service banner grabbed :: mysql 8.0.36' },
  { level: 'INFO', message: 'heartbeat ok :: latency 14ms' },
  { level: 'ALERT', message: 'brute-force detected :: rate-limited' },
  { level: 'EXPLOIT', message: 'shell acquired :: uid=0(root)' },
  { level: 'SCAN', message: 'fingerprinting os :: linux kernel 6.x' },
  { level: 'OPEN', message: 'ftp anonymous login permitted' },
  { level: 'INFO', message: 'exfil tunnel keepalive sent' },
  { level: 'ALERT', message: 'ids evasion trigger :: fragmenting' },
  { level: 'EXPLOIT', message: 'privilege escalation staged' },
]

export interface Target {
  ip: string
  country: string
  code: string
  status: 'BREACHED' | 'PROBING' | 'LOCKED' | 'ONLINE'
  coordinates: [number, number]
  hostname?: string
  city?: string
  isp?: string
  score?: number
  grade?: string
}

export const TARGETS: Target[] = [
  { ip: '45.221.9.10', country: 'RUSSIA', code: 'RU', status: 'BREACHED', coordinates: [37.6, 55.75] },
  { ip: '198.51.100.7', country: 'USA', code: 'US', status: 'PROBING', coordinates: [-95.7, 37.09] },
  { ip: '203.0.113.44', country: 'CHINA', code: 'CN', status: 'ONLINE', coordinates: [104.19, 35.86] },
  { ip: '91.198.174.2', country: 'GERMANY', code: 'DE', status: 'LOCKED', coordinates: [10.45, 51.16] },
  { ip: '177.54.12.9', country: 'BRAZIL', code: 'BR', status: 'PROBING', coordinates: [-51.92, -14.23] },
  { ip: '13.229.88.1', country: 'SINGAPORE', code: 'SG', status: 'ONLINE', coordinates: [103.81, 1.35] },
  { ip: '196.201.7.55', country: 'S.AFRICA', code: 'ZA', status: 'BREACHED', coordinates: [22.93, -30.55] },
]
