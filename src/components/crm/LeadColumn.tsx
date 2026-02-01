import { cn } from "@/lib/utils";
import { LeadCard } from "./LeadCard";
import { LEAD_STATUS_CONFIG, type LeadStatus } from "@/hooks/useLeads";
import type { Tables } from "@/integrations/supabase/types";

interface LeadColumnProps {
  status: LeadStatus;
  leads: (Tables<"leads"> & {
    property_type?: { id: string; name: string } | null;
  })[];
  isDropTarget: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, leadId: string) => void;
  onLeadClick?: (leadId: string) => void;
}

export function LeadColumn({
  status,
  leads,
  isDropTarget,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  onLeadClick,
}: LeadColumnProps) {
  const config = LEAD_STATUS_CONFIG[status];

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border bg-muted/30 min-w-[280px] w-[280px] transition-all",
        isDropTarget && "ring-2 ring-primary ring-offset-2 bg-primary/5"
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Column Header */}
      <div className={cn("p-3 border-b", config.bgColor)}>
        <div className="flex items-center justify-between">
          <h3 className={cn("font-semibold text-sm", config.color)}>
            {config.label}
          </h3>
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", config.bgColor, config.color)}>
            {leads.length}
          </span>
        </div>
      </div>

      {/* Cards Container */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px] max-h-[calc(100vh-320px)]">
        {leads.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">
            Nenhum lead
          </div>
        ) : (
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onDragStart={onDragStart}
              onClick={() => onLeadClick?.(lead.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
