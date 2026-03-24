export interface TenantMasterEntity {
  id: string;
  domain: string;
  dbName: string;
  active: boolean;
}

/** Leitura no Master DB para resolver o banco físico do tenant. */
export interface TenantMasterRepository {
  findById(id: string): Promise<TenantMasterEntity | null>;
  findByDomain(domain: string): Promise<TenantMasterEntity | null>;
}
