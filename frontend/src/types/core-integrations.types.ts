export type DialerProvider = "vonix" | "aspect" | "3c" | "custom";

export interface IntegrationRecord {
  id: string;
  provider: DialerProvider;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
