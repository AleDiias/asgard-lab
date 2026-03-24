import { logger } from "@/infra/logger.js";
import type {
  DialerCampaignCreateInput,
  DialerLeadPayload,
  DialerProvider,
} from "./dialer-provider.interface.js";

/**
 * Adapter Vonix — por agora simula chamadas HTTP (substituir por axios + credenciais reais).
 */
export class VonixDialerAdapter implements DialerProvider {
  async createCampaign(data: DialerCampaignCreateInput): Promise<{ externalCampaignId: string }> {
    logger.info("[VonixDialerAdapter] createCampaign (mock)", { name: data.name });
    return { externalCampaignId: `vonix-cmp-${Date.now()}` };
  }

  async sendLeads(
    externalCampaignId: string,
    leads: DialerLeadPayload[]
  ): Promise<{ externalLeadIdsByLeadId: Record<string, string> }> {
    logger.info("[VonixDialerAdapter] sendLeads (mock)", {
      externalCampaignId,
      count: leads.length,
    });
    const externalLeadIdsByLeadId: Record<string, string> = {};
    for (const lead of leads) {
      externalLeadIdsByLeadId[lead.leadId] = `vonix-lead-${lead.leadId.slice(0, 8)}-${Date.now()}`;
    }
    return { externalLeadIdsByLeadId };
  }

  async pauseCampaign(externalCampaignId: string): Promise<void> {
    logger.info("[VonixDialerAdapter] pauseCampaign (mock)", { externalCampaignId });
  }
}
