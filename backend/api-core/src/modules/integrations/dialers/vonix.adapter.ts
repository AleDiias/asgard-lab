import axios, { type AxiosInstance } from "axios";
import type {
  DialerIntegrationConfig,
  DialerLeadPayload,
  DialerProvider,
  VonixQueueRecord,
} from "./dialer-provider.interface.js";

function createClient(config: DialerIntegrationConfig): AxiosInstance {
  return axios.create({
    baseURL: config.baseUrl,
    timeout: 15000,
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
  });
}

export class VonixDialerAdapter implements DialerProvider {
  async fetchQueues(config: DialerIntegrationConfig): Promise<VonixQueueRecord[]> {
    const client = createClient(config);
    const { data } = await client.get("/v1/queues");
    const rows = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    return rows.map((row: Record<string, unknown>) => ({
      id: String(row.id ?? row.queue_id ?? ""),
      name: String(row.name ?? row.queue_name ?? ""),
      description:
        row.description == null ? null : String(row.description),
    }));
  }

  async fetchResults(config: DialerIntegrationConfig): Promise<Array<Record<string, unknown>>> {
    const client = createClient(config);
    const { data } = await client.get("/v1/results");
    if (Array.isArray(data)) return data as Array<Record<string, unknown>>;
    if (Array.isArray(data?.data)) return data.data as Array<Record<string, unknown>>;
    return [];
  }

  async addSingleContact(
    config: DialerIntegrationConfig,
    contactId: string,
    name: string,
    queueId: string,
    phone: string
  ): Promise<void> {
    const client = createClient(config);
    await client.post(`/v1/contact/${encodeURIComponent(contactId)}`, null, {
      params: {
        contact_name: name,
        queue: queueId,
        "to[1]": `${phone}-1`,
      },
    });
  }

  async removeSingleContact(config: DialerIntegrationConfig, contactId: string): Promise<void> {
    const client = createClient(config);
    await client.delete(`/v1/contact/${encodeURIComponent(contactId)}`);
  }

  async addBulkContacts(
    config: DialerIntegrationConfig,
    queueId: string,
    contacts: DialerLeadPayload[]
  ): Promise<void> {
    const client = createClient(config);
    await client.post(
      `/v1/contacts/${encodeURIComponent(queueId)}`,
      contacts.map((contact) => ({
        id: contact.contactId,
        schedule_at: "",
        priority: "",
        retry: "",
        contact_name: contact.name,
        "to[1]": `${contact.phone}-1`,
      }))
    );
  }

  async removeBulkContacts(config: DialerIntegrationConfig, queueId: string): Promise<void> {
    const client = createClient(config);
    await client.delete(`/v1/contacts/${encodeURIComponent(queueId)}`);
  }
}
