import type { CampaignStatus } from "@/types/core-campaigns.types";

const LABELS: Record<CampaignStatus, string> = {
  draft: "Rascunho",
  syncing: "A sincronizar",
  active: "Ativa",
  paused: "Pausada",
  completed: "Concluída",
};

/** Classes da bolinha para {@link StatusWithDot} (campanhas). */
export function campaignStatusDotClass(status: CampaignStatus): string {
  switch (status) {
    case "active":
      return "bg-emerald-500";
    case "syncing":
      return "bg-sky-500";
    case "paused":
      return "bg-amber-500";
    case "completed":
      return "bg-muted-foreground";
    default:
      return "bg-zinc-400";
  }
}

export function labelCampaignStatus(status: CampaignStatus): string {
  return LABELS[status];
}
