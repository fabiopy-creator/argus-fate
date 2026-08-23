export interface IPLookupResult {
  status: 'success' | 'fail'
  message?: string
  country: string
  countryCode: string
  region: string
  regionName: string
  city: string
  zip: string
  lat: number
  lon: number
  timezone: string
  isp: string
  org: string
  as: string
  query: string
}

/**
 * Lookup IP geolocation using ip-api.com (free, no key required).
 * Rate limit: 45 requests per minute.
 * Note: free tier uses HTTP only (no HTTPS).
 */
export async function lookupIP(ip: string): Promise<IPLookupResult> {
  const res = await fetch(
    `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`
  )
  if (!res.ok) {
    throw new Error(`IP lookup failed: ${res.status}`)
  }
  return res.json()
}

/**
 * Get the current user's public IP info.
 */
export async function lookupSelfIP(): Promise<IPLookupResult> {
  const res = await fetch(
    'http://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query'
  )
  if (!res.ok) {
    throw new Error(`Self IP lookup failed: ${res.status}`)
  }
  return res.json()
}
