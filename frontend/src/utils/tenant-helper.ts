/**
 * Extrai o subdomínio do hostname atual para resolução multi-tenant.
 * Ex.: demo.localhost → "demo"; demo.asgardai.com.br → "demo".
 * Fallback em dev: localhost sem subdomínio → "demo".
 */
export function getTenantDomain(): string {
  if (typeof window === "undefined") {
    return "demo";
  }
  const hostname = window.location.hostname;
  const parts = hostname.split(".");
  if (parts.length <= 1) {
    return "demo";
  }
  if (hostname === "localhost") {
    return "demo";
  }
  const subdomain = parts[0];
  if (subdomain === "www" || subdomain === "admin") {
    return "demo";
  }
  return subdomain;
}
