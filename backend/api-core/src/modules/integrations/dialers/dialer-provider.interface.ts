/**
 * Contrato genérico para discadores parceiros (Vonix, Aspect, 3C, etc.).
 * O CRM orquestra; a discagem ocorre no sistema externo.
 */
export interface DialerCampaignCreateInput {
  name: string;
}

export interface DialerLeadPayload {
  leadId: string;
  phone: string;
  name: string;
}

export interface DialerProvider {
  createCampaign(data: DialerCampaignCreateInput): Promise<{ externalCampaignId: string }>;
  sendLeads(
    externalCampaignId: string,
    leads: DialerLeadPayload[]
  ): Promise<{ externalLeadIdsByLeadId: Record<string, string> }>;
  pauseCampaign(externalCampaignId: string): Promise<void>;
}
