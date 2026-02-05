import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Building2, Users, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface ActivityItem {
  id: string;
  type: "property" | "lead" | "payment";
  title: string;
  description: string;
  timestamp: string;
}

export function RecentActivity() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["recent-activity"],
    queryFn: async () => {
      const items: ActivityItem[] = [];

      // Últimos imóveis cadastrados
      const { data: properties } = await supabase
        .from("properties")
        .select("id, title, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      properties?.forEach((p) => {
        items.push({
          id: `property-${p.id}`,
          type: "property",
          title: p.title,
          description: "Imóvel cadastrado",
          timestamp: p.created_at,
        });
      });

      // Últimos leads atualizados
      const { data: leads } = await supabase
        .from("leads")
        .select("id, name, updated_at, status")
        .order("updated_at", { ascending: false })
        .limit(3);

      leads?.forEach((l) => {
        items.push({
          id: `lead-${l.id}`,
          type: "lead",
          title: l.name,
          description: `Lead atualizado - ${l.status}`,
          timestamp: l.updated_at,
        });
      });

      // Últimas parcelas pagas
      const { data: payments } = await supabase
        .from("rental_installments")
        .select("id, paid_value, payment_date, reference_month")
        .eq("status", "pago")
        .order("payment_date", { ascending: false })
        .limit(3);

      payments?.forEach((p) => {
        if (p.payment_date) {
          items.push({
            id: `payment-${p.id}`,
            type: "payment",
            title: formatCurrency(p.paid_value ?? 0),
            description: `Parcela paga - ${formatMonthYear(p.reference_month)}`,
            timestamp: p.payment_date,
          });
        }
      });

      // Ordenar por data mais recente
      return items.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ).slice(0, 5);
    },
    refetchInterval: 60000,
  });

  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "property":
        return Building2;
      case "lead":
        return Users;
      case "payment":
        return Receipt;
    }
  };

  const getIconColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "property":
        return "text-blue-600 bg-blue-100";
      case "lead":
        return "text-green-600 bg-green-100";
      case "payment":
        return "text-purple-600 bg-purple-100";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : activities?.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma atividade recente. Cadastre imóveis e leads para começar.
          </p>
        ) : (
          <div className="space-y-4">
            {activities?.map((activity) => {
              const Icon = getIcon(activity.type);
              const colorClass = getIconColor(activity.type);
              return (
                <div key={activity.id} className="flex items-center gap-3">
                  <div className={`rounded-full p-2 ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(activity.timestamp), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatMonthYear(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
}
