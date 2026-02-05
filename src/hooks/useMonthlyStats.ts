import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface MonthlyLeadStats {
  month: string;
  label: string;
  novos: number;
  fechados: number;
  perdidos: number;
  total: number;
}

export interface MonthlyRevenueStats {
  month: string;
  label: string;
  revenue: number;
}

export interface MonthlyStats {
  leads: MonthlyLeadStats[];
  revenue: MonthlyRevenueStats[];
}

export function useMonthlyStats() {
  return useQuery({
    queryKey: ["monthly-stats"],
    queryFn: async (): Promise<MonthlyStats> => {
      const now = new Date();
      const sixMonthsAgo = subMonths(startOfMonth(now), 5);

      // Buscar todos os leads dos últimos 6 meses
      const { data: leads } = await supabase
        .from("leads")
        .select("created_at, status")
        .gte("created_at", sixMonthsAgo.toISOString());

      // Buscar todos os pagamentos dos últimos 6 meses
      const { data: payments } = await supabase
        .from("rental_installments")
        .select("payment_date, paid_value")
        .eq("status", "pago")
        .gte("payment_date", sixMonthsAgo.toISOString());

      // Processar leads por mês
      const leadsPerMonth = processLeadsByMonth(leads ?? [], now);

      // Processar faturamento por mês
      const revenuePerMonth = processRevenueByMonth(payments ?? [], now);

      return {
        leads: leadsPerMonth,
        revenue: revenuePerMonth,
      };
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutos
  });
}

function processLeadsByMonth(
  leads: { created_at: string; status: string }[],
  now: Date
): MonthlyLeadStats[] {
  const months: MonthlyLeadStats[] = [];

  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const monthKey = format(monthStart, "yyyy-MM");
    const label = format(monthDate, "MMM", { locale: ptBR });

    const monthLeads = leads.filter((lead) => {
      const createdAt = new Date(lead.created_at);
      return createdAt >= monthStart && createdAt <= monthEnd;
    });

    months.push({
      month: monthKey,
      label: label.charAt(0).toUpperCase() + label.slice(1),
      novos: monthLeads.filter((l) => l.status === "novo").length,
      fechados: monthLeads.filter((l) => l.status === "fechado").length,
      perdidos: monthLeads.filter((l) => l.status === "perdido").length,
      total: monthLeads.length,
    });
  }

  return months;
}

function processRevenueByMonth(
  payments: { payment_date: string | null; paid_value: number | null }[],
  now: Date
): MonthlyRevenueStats[] {
  const months: MonthlyRevenueStats[] = [];

  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const monthKey = format(monthStart, "yyyy-MM");
    const label = format(monthDate, "MMM", { locale: ptBR });

    const monthPayments = payments.filter((p) => {
      if (!p.payment_date) return false;
      const paymentDate = new Date(p.payment_date);
      return paymentDate >= monthStart && paymentDate <= monthEnd;
    });

    const revenue = monthPayments.reduce(
      (sum, p) => sum + (p.paid_value || 0),
      0
    );

    months.push({
      month: monthKey,
      label: label.charAt(0).toUpperCase() + label.slice(1),
      revenue,
    });
  }

  return months;
}
