export interface TenantEntity {
  id: string;
  domain: string;
  dbName: string;
  features: string[];
  active: boolean;
}

export interface TenantRepository {
  findByDomain(domain: string): Promise<TenantEntity | null>;
}
