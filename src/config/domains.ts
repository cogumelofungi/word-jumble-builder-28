/**
 * Configuração centralizada de domínios da aplicação
 */

export const APP_CONFIG = {
  // Domínio de produção onde os apps são publicados - detecta automaticamente
  get PRODUCTION_DOMAIN() {
    return window.location.origin;
  },
  
  // URL base para apps publicados
  get APP_BASE_URL() {
    return `${this.PRODUCTION_DOMAIN}/app`;
  }
};

/**
 * Retorna a URL completa para um app publicado
 */
export const getAppUrl = (slug: string): string => {
  return `${APP_CONFIG.APP_BASE_URL}/${slug}`;
};

/**
 * Retorna apenas o domínio para exibição na UI
 */
export const getAppDomainForDisplay = (): string => {
  return `${APP_CONFIG.PRODUCTION_DOMAIN.replace('https://', '')}/app/`;
};