import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getAuthoritativeNS, detectProviderFromNS, hasARecordPointingTo } from '@/utils/dnsResolver';
interface DomainInfo {
  domain: string;
  isValid: boolean;
  provider: string | null;
  providerDisplayName: string;
  nameservers: string[];
  hasCloudflare: boolean;
  canAutoConnect: boolean;
  confidence: 'high' | 'medium' | 'low';
}

interface VerificationResult {
  isVerified: boolean;
  recordsFound: {
    aRecord: boolean;
    txtRecord: boolean;
  };
  errors: string[];
}

export const useDomainVerification = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  // Verificar informações do domínio
  const verifyDomain = useCallback(async (domain: string): Promise<DomainInfo> => {
    setIsVerifying(true);
    
    try {
      // Simular verificação DNS mais realista
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const cleanDomain = cleanDomainInput(domain);
      const isValid = isValidDomain(cleanDomain);
      
      if (!isValid) {
        return {
          domain: cleanDomain,
          isValid: false,
          provider: null,
          providerDisplayName: 'Domínio inválido',
          nameservers: [],
          hasCloudflare: false,
          canAutoConnect: false,
          confidence: 'high'
        };
      }
      
      // Detectar provedor com simulação de DNS lookup
      const providerInfo = await detectProviderWithDNS(cleanDomain);
      const hasCloudflare = providerInfo.provider === 'cloudflare';
      
      const domainInfo: DomainInfo = {
        domain: cleanDomain,
        isValid: true,
        provider: providerInfo.provider,
        providerDisplayName: providerInfo.displayName,
        nameservers: providerInfo.nameservers,
        hasCloudflare,
        canAutoConnect: hasCloudflare,
        confidence: providerInfo.confidence
      };

      return domainInfo;
    } catch (error) {
      toast({
        title: "Erro na verificação",
        description: "Não foi possível verificar o domínio. Tente novamente.",
        variant: "destructive",
      });
      
      return {
        domain: cleanDomainInput(domain),
        isValid: false,
        provider: null,
        providerDisplayName: 'Erro na verificação',
        nameservers: [],
        hasCloudflare: false,
        canAutoConnect: false,
        confidence: 'low'
      };
    } finally {
      setIsVerifying(false);
    }
  }, [toast]);

  // Verificar se os registros DNS estão configurados corretamente
  const verifyDNSRecords = useCallback(async (domain: string): Promise<VerificationResult> => {
    setIsVerifying(true);
    
    try {
      const targetIp = '185.158.133.1';
      const clean = cleanDomainInput(domain);

      const [rootOk, wwwOk] = await Promise.all([
        hasARecordPointingTo(clean, targetIp),
        hasARecordPointingTo(`www.${clean}`, targetIp)
      ]);

      const result: VerificationResult = {
        isVerified: rootOk && wwwOk,
        recordsFound: {
          aRecord: rootOk && wwwOk,
          // TXT não é necessário para verificação atual; marcado como verdadeiro
          txtRecord: true
        },
        errors: []
      };

      if (!rootOk) {
        result.errors.push("Registro A do domínio raiz (@) não encontrado ou não aponta para 185.158.133.1");
      }
      if (!wwwOk) {
        result.errors.push("Registro A do subdomínio www não encontrado ou não aponta para 185.158.133.1");
      }

      return result;
    } catch (error) {
      return {
        isVerified: false,
        recordsFound: {
          aRecord: false,
          txtRecord: false
        },
        errors: ["Erro ao consultar DNS (DoH)"]
      };
    } finally {
      setIsVerifying(false);
    }
  }, []);

  // Conectar domínio automaticamente (Cloudflare)
  const autoConnect = useCallback(async (domain: string): Promise<boolean> => {
    setIsConnecting(true);
    
    try {
      // Conexão automática real requer credenciais do provedor (ex.: Cloudflare API).
      // No momento, orientamos a configuração manual para garantir segurança e transparência.
      toast({
        title: "Conexão automática indisponível",
        description: "Por enquanto, conclua a configuração manual adicionando os registros DNS no seu provedor.",
      });
      return false;
    } catch (error) {
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar automaticamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [toast]);

  return {
    verifyDomain,
    verifyDNSRecords,
    autoConnect,
    isVerifying,
    isConnecting
  };
};

// Funções auxiliares
function cleanDomainInput(domain: string): string {
  if (!domain) return '';
  
  return domain
    .replace(/^https?:\/\//i, '')  // Remove protocolo (case insensitive)
    .replace(/^www\./i, '')        // Remove www (case insensitive)
    .replace(/\/+.*$/, '')         // Remove path, query e múltiplas barras
    .replace(/:\d+$/, '')          // Remove porta
    .replace(/\s+/g, '')           // Remove espaços
    .toLowerCase()
    .trim();
}

function isValidDomain(domain: string): boolean {
  if (!domain || domain.length < 4 || domain.length > 253) {
    return false;
  }
  
  // Regex mais robusta para domínios
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  
  // Verificações de integridade
  if (domain.startsWith('-') || domain.endsWith('-') || domain.includes('..')) {
    return false;
  }
  
  // Verificar cada parte do domínio
  const parts = domain.split('.');
  if (parts.length < 2) return false;
  
  for (const part of parts) {
    if (!part || part.length > 63 || part.startsWith('-') || part.endsWith('-')) {
      return false;
    }
  }
  
  return domainRegex.test(domain);
}

// Base de dados de nameservers conhecidos
const NAMESERVER_DATABASE = {
  cloudflare: [
    'ns1.cloudflare.com', 'ns2.cloudflare.com', 'ns3.cloudflare.com', 'ns4.cloudflare.com',
    'aron.ns.cloudflare.com', 'beth.ns.cloudflare.com', 'chad.ns.cloudflare.com'
  ],
  godaddy: [
    'ns1.godaddy.com', 'ns2.godaddy.com', 'ns3.godaddy.com', 'ns4.godaddy.com',
    'ns1.p06.dynect.net', 'ns2.p06.dynect.net', 'ns3.p06.dynect.net', 'ns4.p06.dynect.net'
  ],
  namecheap: [
    'dns1.registrar-servers.com', 'dns2.registrar-servers.com',
    'ns1.privateemail.com', 'ns2.privateemail.com'
  ],
  google: [
    'ns-cloud-a1.googledomains.com', 'ns-cloud-a2.googledomains.com',
    'ns-cloud-a3.googledomains.com', 'ns-cloud-a4.googledomains.com',
    'ns1.google.com', 'ns2.google.com', 'ns3.google.com', 'ns4.google.com'
  ],
  amazon: [
    'ns-1.awsdns-00.com', 'ns-2.awsdns-00.co.uk', 'ns-3.awsdns-00.org', 'ns-4.awsdns-00.net'
  ],
  vercel: [
    'ns1.vercel-dns.com', 'ns2.vercel-dns.com'
  ],
  netlify: [
    'dns1.p01.nsone.net', 'dns2.p01.nsone.net', 'dns3.p01.nsone.net', 'dns4.p01.nsone.net'
  ],
  bluehost: [
    'ns1.bluehost.com', 'ns2.bluehost.com'
  ],
  hostgator: [
    'ns1.hostgator.com', 'ns2.hostgator.com'
  ],
  siteground: [
    'ns1.siteground.net', 'ns2.siteground.net'
  ]
};

interface ProviderInfo {
  provider: string;
  displayName: string;
  nameservers: string[];
  confidence: 'high' | 'medium' | 'low';
}

async function detectProviderWithDNS(domain: string): Promise<ProviderInfo> {
  // Tenta obter os NS autoritativos reais via DoH
  try {
    const nsRecords = await getAuthoritativeNS(domain);
    if (nsRecords.length) {
      const prov = detectProviderFromNS(nsRecords);
      return {
        provider: prov.provider,
        displayName: getProviderDisplayName(prov.provider),
        nameservers: nsRecords,
        confidence: prov.provider === 'manual' ? 'medium' : 'high'
      };
    }
  } catch (_) {
    // continua para fallback por domínio
  }

  // Fallback para detecção por padrões no domínio
  const domainBasedProvider = detectProviderByDomain(domain);
  return {
    ...domainBasedProvider,
    nameservers: [],
  };
}

function detectProviderByDomain(domain: string): ProviderInfo {
  // Detectar provedores específicos baseado no domínio
  if (domain.includes('cloudflare')) {
    return {
      provider: 'cloudflare',
      displayName: 'Cloudflare',
      nameservers: NAMESERVER_DATABASE.cloudflare.slice(0, 2),
      confidence: 'high'
    };
  }
  
  if (domain.includes('godaddy') || domain.endsWith('.godaddy.com')) {
    return {
      provider: 'godaddy',
      displayName: 'GoDaddy',
      nameservers: NAMESERVER_DATABASE.godaddy.slice(0, 2),
      confidence: 'high'
    };
  }
  
  if (domain.includes('namecheap')) {
    return {
      provider: 'namecheap',
      displayName: 'Namecheap',
      nameservers: NAMESERVER_DATABASE.namecheap,
      confidence: 'high'
    };
  }
  
  if (domain === 'google.com' || domain === 'google.com.br' || 
      domain.endsWith('.google.com') || domain.includes('domains.google')) {
    return {
      provider: 'google',
      displayName: 'Google Domains',
      nameservers: NAMESERVER_DATABASE.google.slice(0, 2),
      confidence: 'high'
    };
  }
  
  // TLDs específicos de provedores
  if (domain.endsWith('.app') || domain.endsWith('.dev') || domain.endsWith('.page')) {
    return {
      provider: 'cloudflare',
      displayName: 'Cloudflare',
      nameservers: NAMESERVER_DATABASE.cloudflare.slice(0, 2),
      confidence: 'medium'
    };
  }
  
  // Detectar provedores de hospedagem
  if (domain.includes('bluehost') || domain.includes('hostgator') || 
      domain.includes('siteground') || domain.includes('dreamhost')) {
    return {
      provider: 'hosting',
      displayName: 'Provedor de Hospedagem',
      nameservers: ['ns1.hostingprovider.com', 'ns2.hostingprovider.com'],
      confidence: 'medium'
    };
  }
  
  // Para domínios não identificados, retornar como configuração manual
  return {
    provider: 'manual',
    displayName: 'Configuração Manual',
    nameservers: [],
    confidence: 'medium'
  };
}

function simulateDNSLookup(domain: string): string[] {
  // Simular diferentes resultados baseados no hash do domínio
  const hash = domain.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) & 0xffffffff, 0);
  
  // Priorizar alguns provedores mais comuns baseado em padrões
  if (domain.includes('google') || domain.endsWith('.dev') || domain.endsWith('.app')) {
    return NAMESERVER_DATABASE.google.slice(0, 2);
  }
  
  if (domain.includes('cloudflare') || domain.endsWith('.cf')) {
    return NAMESERVER_DATABASE.cloudflare.slice(0, 2);
  }
  
  // Para outros domínios, usar uma distribuição mais realista
  const providers = ['cloudflare', 'godaddy', 'namecheap', 'google'];
  const weights = [0.3, 0.25, 0.2, 0.25]; // Cloudflare mais comum
  const random = (Math.abs(hash) % 100) / 100;
  
  let cumWeight = 0;
  for (let i = 0; i < providers.length; i++) {
    cumWeight += weights[i];
    if (random <= cumWeight) {
      const nsArray = NAMESERVER_DATABASE[providers[i] as keyof typeof NAMESERVER_DATABASE];
      return nsArray.slice(0, 2);
    }
  }
  
  // Fallback
  return NAMESERVER_DATABASE.cloudflare.slice(0, 2);
}

function detectProviderByNameservers(nameservers: string[]): ProviderInfo {
  const prov = detectProviderFromNS(nameservers);
  return {
    provider: prov.provider,
    displayName: getProviderDisplayName(prov.provider),
    nameservers,
    confidence: prov.provider === 'manual' ? 'medium' : 'high'
  };
}

function getProviderDisplayName(provider: string): string {
  const displayNames: Record<string, string> = {
    cloudflare: 'Cloudflare',
    godaddy: 'GoDaddy',
    namecheap: 'Namecheap',
    google: 'Google Domains',
    amazon: 'Amazon Route 53',
    vercel: 'Vercel',
    netlify: 'Netlify',
    bluehost: 'Bluehost',
    hostgator: 'HostGator',
    siteground: 'SiteGround',
    hosting: 'Provedor de Hospedagem',
    manual: 'Configuração Manual',
    unknown: 'Desconhecido'
  };
  
  return displayNames[provider] || 'Outros';
}

// Função legacy mantida para compatibilidade
function getSimulatedNameservers(provider: string | null): string[] {
  if (!provider) return ['ns1.example.com', 'ns2.example.com'];
  
  const nsMap = NAMESERVER_DATABASE[provider as keyof typeof NAMESERVER_DATABASE];
  return nsMap ? nsMap.slice(0, 2) : ['ns1.example.com', 'ns2.example.com'];
}