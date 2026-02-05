import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth } from "date-fns";
import type { Enums } from "@/integrations/supabase/types";

type LeadStatus = Enums<"lead_status">;

export interface DashboardStats {
  activeProperties: number;
  totalLeads: number;
  leadsByStatus: Record<LeadStatus, number>;
  activeRentals: number;
  monthlyRevenue: number;
  isLoading: boolean;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      // Imóveis disponíveis
      const { count: activeProperties } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("status", "disponivel");

      // Leads (todos para calcular por status)
      const { data: leads } = await supabase
        .from("leads")
        .select("status");

      const leadsByStatus = (leads ?? []).reduce((acc, lead) => {
        const status = lead.status as LeadStatus;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<LeadStatus, number>);

      const totalLeads = (leads ?? []).filter(
        (l) => l.status !== "fechado" && l.status !== "perdido"
      ).length;

      // Contratos ativos
      const { count: activeRentals } = await supabase
        .from("rentals")
        .select("*", { count: "exact", head: true })
        .eq("status", "ativo");

      // Faturamento do mês
      const now = new Date();
      const monthStart = startOfMonth(now).toISOString();
      const monthEnd = endOfMonth(now).toISOString();

      const { data: payments } = await supabase
        .from("rental_installments")
        .select("paid_value")
        .eq("status", "pago")
        .gte("payment_date", monthStart)
        .lte("payment_date", monthEnd);

      const monthlyRevenue = (payments ?? []).reduce(
        (sum, p) => sum + (p.paid_value || 0),
        0
      );

      return {
        activeProperties: activeProperties ?? 0,
        totalLeads,
        leadsByStatus,
        activeRentals: activeRentals ?? 0,
        monthlyRevenue,
      };
    },
    refetchInterval: 60000, // Atualiza a cada minuto
  });
}
