export type DialerProvider = "vonix" | "aspect" | "3c" | "custom";

export interface IntegrationRecord {
  id: string;
  provider: DialerProvider;
  name: string;
  baseUrl: string;
  queues: Array<{ id: string; name: string; description?: string | null }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
