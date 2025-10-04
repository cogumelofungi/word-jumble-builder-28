// Real DNS resolver using DNS-over-HTTPS (Google DNS)
// Provides NS and A record lookups with provider detection

export type DnsRecordType = 'A' | 'NS' | 'TXT' | 'AAAA' | 'CNAME';

const DOH_ENDPOINT = 'https://dns.google/resolve';

interface DnsAnswer {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

interface DnsResponse {
  Status: number;
  TC?: boolean;
  RD?: boolean;
  RA?: boolean;
  AD?: boolean;
  CD?: boolean;
  Question?: { name: string; type: number }[];
  Answer?: DnsAnswer[];
  Authority?: DnsAnswer[];
  Comment?: string;
}

const PROVIDER_PATTERNS: Record<string, string[]> = {
  cloudflare: ['.ns.cloudflare.com', '.cloudflare.com'],
  google: ['.googledomains.com', '.google.com'],
  godaddy: ['.godaddy.com', '.p06.dynect.net', '.dynect.net'],
  namecheap: ['.registrar-servers.com', '.privateemail.com'],
  amazon: ['awsdns-'], // handled with includes
  vercel: ['.vercel-dns.com'],
  netlify: ['.nsone.net'],
  bluehost: ['.bluehost.com'],
  hostgator: ['.hostgator.com'],
  siteground: ['.siteground.net']
};

export async function queryDNS(name: string, type: DnsRecordType): Promise<DnsResponse> {
  const url = `${DOH_ENDPOINT}?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`;
  const res = await fetch(url, {
    headers: { 'accept': 'application/dns-json' }
  });
  if (!res.ok) throw new Error(`DNS query failed: ${res.status}`);
  return res.json();
}

export async function getNSRecords(name: string): Promise<string[]> {
  const json = await queryDNS(name, 'NS');
  const list = (json.Answer || []).map(a => a.data.replace(/\.$/, '').toLowerCase());
  return [...new Set(list)];
}

export async function getARecords(name: string): Promise<string[]> {
  const json = await queryDNS(name, 'A');
  const list = (json.Answer || []).map(a => a.data.trim());
  return [...new Set(list)];
}

export async function getAuthoritativeNS(domain: string): Promise<string[]> {
  // Try domain, then progressively higher-level domains
  let current = domain.toLowerCase().replace(/\.$/, '');
  for (let i = 0; i < 5; i++) {
    if (!current || current.indexOf('.') === -1) break;
    try {
      const ns = await getNSRecords(current);
      if (ns.length) return ns;
    } catch (_) {
      // ignore and try parent
    }
    const parts = current.split('.');
    parts.shift();
    current = parts.join('.');
  }
  return [];
}

export function detectProviderFromNS(nsRecords: string[]): { provider: string; displayName: string } {
  const lower = nsRecords.map(n => n.toLowerCase());

  // Helper to check endsWith patterns
  const hasPattern = (patterns: string[]) =>
    lower.some(ns => patterns.some(p => (p.startsWith('.') ? ns.endsWith(p) : ns.includes(p))));

  if (hasPattern(PROVIDER_PATTERNS.cloudflare)) return { provider: 'cloudflare', displayName: 'Cloudflare' };
  if (hasPattern(PROVIDER_PATTERNS.google)) return { provider: 'google', displayName: 'Google Domains' };
  if (hasPattern(PROVIDER_PATTERNS.godaddy)) return { provider: 'godaddy', displayName: 'GoDaddy' };
  if (hasPattern(PROVIDER_PATTERNS.namecheap)) return { provider: 'namecheap', displayName: 'Namecheap' };
  if (hasPattern(PROVIDER_PATTERNS.vercel)) return { provider: 'vercel', displayName: 'Vercel' };
  if (hasPattern(PROVIDER_PATTERNS.netlify)) return { provider: 'netlify', displayName: 'Netlify' };
  if (hasPattern(PROVIDER_PATTERNS.bluehost)) return { provider: 'bluehost', displayName: 'Bluehost' };
  if (hasPattern(PROVIDER_PATTERNS.hostgator)) return { provider: 'hostgator', displayName: 'HostGator' };
  if (hasPattern(PROVIDER_PATTERNS.siteground)) return { provider: 'siteground', displayName: 'SiteGround' };
  if (hasPattern(PROVIDER_PATTERNS.amazon)) return { provider: 'amazon', displayName: 'Amazon Route 53' };

  return { provider: 'manual', displayName: 'Configuração Manual' };
}

export async function hasARecordPointingTo(name: string, ip: string): Promise<boolean> {
  try {
    const records = await getARecords(name);
    return records.includes(ip);
  } catch (_) {
    return false;
  }
}
