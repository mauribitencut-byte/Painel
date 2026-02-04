import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { differenceInHours } from "date-fns";
import {
  getThresholdByStatus,
  getUrgencyLevel,
  getUrgencyColor,
} from "@/hooks/useStaleLeads";
import type { Database } from "@/integrations/supabase/types";

type LeadStatus = Database["public"]["Enums"]["lead_status"];

interface StaleLeadIndicatorProps {
  updatedAt: string;
  status: LeadStatus;
}

export function StaleLeadIndicator({ updatedAt, status }: StaleLeadIndicatorProps) {
  const hoursSinceUpdate = differenceInHours(new Date(), new Date(updatedAt));
  const threshold = getThresholdByStatus(status);
  const urgencyLevel = getUrgencyLevel(hoursSinceUpdate, threshold);
  const colorClass = getUrgencyColor(urgencyLevel);

  const urgencyLabels = {
    recent: "Recente",
    attention: "Atenção",
    urgent: "Urgente",
    critical: "Crítico",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${colorClass} flex-shrink-0`}
            aria-label={`Status: ${urgencyLabels[urgencyLevel]}`}
          />
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <div className="font-medium">{urgencyLabels[urgencyLevel]}</div>
          <div className="text-muted-foreground">
            Atualizado{" "}
            {formatDistanceToNow(new Date(updatedAt), {
              addSuffix: true,
              locale: ptBR,
            })}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
