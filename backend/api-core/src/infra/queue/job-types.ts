export type DialerSyncAction = "add_single" | "add_bulk" | "remove_single" | "remove_bulk";

export interface DialerSyncJobPayload {
  action: DialerSyncAction;
  tenantDatabaseName: string;
  integrationId: string;
  campaignId?: string;
  queueId?: string;
  contactId?: string;
  contactName?: string;
  phone?: string;
  contacts?: Array<{ contactId: string; name: string; phone: string }>;
}

export interface DialerResultsJobPayload {
  runAt: string;
}
