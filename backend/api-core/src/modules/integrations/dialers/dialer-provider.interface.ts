export interface VonixQueueRecord {
  id: string;
  name: string;
  description?: string | null;
}

export interface DialerLeadPayload {
  contactId: string;
  phone: string;
  name: string;
}

export interface DialerIntegrationConfig {
  baseUrl: string;
  apiKey: string;
}

export interface DialerProvider {
  fetchQueues(config: DialerIntegrationConfig): Promise<VonixQueueRecord[]>;
  fetchResults(config: DialerIntegrationConfig): Promise<Array<Record<string, unknown>>>;
  addSingleContact(
    config: DialerIntegrationConfig,
    contactId: string,
    name: string,
    queueId: string,
    phone: string
  ): Promise<void>;
  removeSingleContact(config: DialerIntegrationConfig, contactId: string): Promise<void>;
  addBulkContacts(
    config: DialerIntegrationConfig,
    queueId: string,
    contacts: DialerLeadPayload[]
  ): Promise<void>;
  removeBulkContacts(config: DialerIntegrationConfig, queueId: string): Promise<void>;
}
