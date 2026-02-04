import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInHours } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type LeadStatus = Database["public"]["Enums"]["lead_status"];

type Lead = Database["public"]["Tables"]["leads"]["Row"];

export interface StaleLeadInfo {
  lead: Lead;
  hoursSinceUpdate: number;
  threshold: number;
  urgencyLevel: "recent" | "attention" | "urgent" | "critical";
}

const statusThresholds: Record<LeadStatus, number> = {
  novo: 24,
  em_atendimento: 48,
  qualificado: 72,
  proposta: 120,
  fechado: Infinity,
  perdido: Infinity,
};

export function getThresholdByStatus(status: LeadStatus): number {
  return statusThresholds[status] ?? 24;
}

export function getUrgencyLevel(
  hoursSinceUpdate: number,
  threshold: number
): StaleLeadInfo["urgencyLevel"] {
  if (hoursSinceUpdate < threshold * 0.5) return "recent";
  if (hoursSinceUpdate < threshold) return "attention";
  if (hoursSinceUpdate < threshold * 1.5) return "urgent";
  return "critical";
}

export function getUrgencyColor(urgencyLevel: StaleLeadInfo["urgencyLevel"]): string {
  switch (urgencyLevel) {
    case "recent":
      return "bg-green-500";
    case "attention":
      return "bg-yellow-500";
    case "urgent":
      return "bg-orange-500";
    case "critical":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}

export function useStaleLeads() {
  return useQuery({
    queryKey: ["stale-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .not("status", "in", "(fechado,perdido)")
        .order("updated_at", { ascending: true });

      if (error) throw error;
      if (!data) return [];

      const staleLeads: StaleLeadInfo[] = [];

      for (const lead of data) {
        const hoursSinceUpdate = differenceInHours(
          new Date(),
          new Date(lead.updated_at)
        );
        const threshold = getThresholdByStatus(lead.status);
        const urgencyLevel = getUrgencyLevel(hoursSinceUpdate, threshold);

        // Only include leads that need attention (past 50% of threshold)
        if (hoursSinceUpdate >= threshold * 0.5) {
          staleLeads.push({
            lead,
            hoursSinceUpdate,
            threshold,
            urgencyLevel,
          });
        }
      }

      // Sort by urgency (most critical first)
      return staleLeads.sort((a, b) => {
        const urgencyOrder = { critical: 0, urgent: 1, attention: 2, recent: 3 };
        return urgencyOrder[a.urgencyLevel] - urgencyOrder[b.urgencyLevel];
      });
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
}

export function useStaleLeadsCount() {
  const { data } = useStaleLeads();
  
  // Count only urgent and critical leads for the badge
  return data?.filter(
    (item) => item.urgencyLevel === "urgent" || item.urgencyLevel === "critical"
  ).length ?? 0;
}
