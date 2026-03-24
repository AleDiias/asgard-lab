/**
 * Placeholder para conexões Master DB e Tenant DB.
 * Em produção: Connection Pool Manager e conexões dinâmicas por tenant.
 */
export type DbConnection = unknown;

export const db = {
  getMasterConnection(): DbConnection {
    return {} as DbConnection;
  },
  getTenantConnection(_tenantId: string): DbConnection {
    return {} as DbConnection;
  },
};
