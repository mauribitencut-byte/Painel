import { Phone, Mail, DollarSign, GripVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";

interface LeadCardProps {
  lead: Tables<"leads"> & {
    property_type?: { id: string; name: string } | null;
  };
  onDragStart: (e: React.DragEvent, leadId: string) => void;
  onClick?: () => void;
}

export function LeadCard({ lead, onDragStart, onClick }: LeadCardProps) {
  const formatCurrency = (value: number | null) => {
    if (!value) return null;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const interestLabel = {
    venda: "Compra",
    locacao: "Locação",
    ambos: "Compra/Locação",
  };

  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      onClick={onClick}
      className="cursor-grab bg-card shadow-sm hover:shadow-md transition-shadow active:cursor-grabbing group"
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{lead.name}</h4>
            {lead.source && (
              <p className="text-xs text-muted-foreground">Origem: {lead.source}</p>
            )}
          </div>
          <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </div>

        <div className="flex flex-wrap gap-1">
          {lead.interest_type && (
            <Badge variant="secondary" className="text-xs">
              {interestLabel[lead.interest_type]}
            </Badge>
          )}
          {lead.property_type?.name && (
            <Badge variant="outline" className="text-xs">
              {lead.property_type.name}
            </Badge>
          )}
        </div>

        <div className="space-y-1 text-xs text-muted-foreground">
          {lead.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span className="truncate">{lead.phone}</span>
            </div>
          )}
          {lead.email && (
            <div className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              <span className="truncate">{lead.email}</span>
            </div>
          )}
          {(lead.budget_min || lead.budget_max) && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              <span>
                {lead.budget_min && lead.budget_max
                  ? `${formatCurrency(Number(lead.budget_min))} - ${formatCurrency(Number(lead.budget_max))}`
                  : lead.budget_max
                  ? `Até ${formatCurrency(Number(lead.budget_max))}`
                  : `A partir de ${formatCurrency(Number(lead.budget_min))}`}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
