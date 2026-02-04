import { Link } from "react-router-dom";
import { AlertTriangle, Clock, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStaleLeads, getUrgencyColor } from "@/hooks/useStaleLeads";

const statusLabels: Record<string, string> = {
  novo: "Novo",
  em_atendimento: "Em Atendimento",
  qualificado: "Qualificado",
  proposta: "Proposta",
  fechado: "Fechado",
  perdido: "Perdido",
};

export function LeadAlerts() {
  const { data: staleLeads, isLoading } = useStaleLeads();

  // Filter only urgent and critical leads
  const alertLeads = staleLeads?.filter(
    (item) => item.urgencyLevel === "urgent" || item.urgencyLevel === "critical"
  );

  if (isLoading) {
    return (
      <Card className="border-orange-200 dark:border-orange-900">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Carregando alertas...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!alertLeads?.length) {
    return null;
  }

  return (
    <Card className="border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Leads que Precisam de Atenção
            <Badge variant="destructive" className="ml-2">
              {alertLeads.length}
            </Badge>
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/leads" className="flex items-center gap-1">
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {alertLeads.slice(0, 5).map((item) => (
            <div
              key={item.lead.id}
              className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`h-3 w-3 rounded-full flex-shrink-0 ${getUrgencyColor(
                    item.urgencyLevel
                  )}`}
                />
                <div className="min-w-0">
                  <p className="font-medium truncate">{item.lead.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {statusLabels[item.lead.status]}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(item.lead.updated_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/leads">Atender</Link>
              </Button>
            </div>
          ))}
          {alertLeads.length > 5 && (
            <p className="text-sm text-muted-foreground text-center pt-2">
              E mais {alertLeads.length - 5} leads aguardando atenção
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
