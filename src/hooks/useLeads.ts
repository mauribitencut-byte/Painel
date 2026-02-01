import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert, TablesUpdate, Enums } from "@/integrations/supabase/types";

export type LeadStatus = Enums<"lead_status">;
type LeadInsert = TablesInsert<"leads">;
type LeadUpdate = TablesUpdate<"leads">;

interface LeadFilters {
  search?: string;
  status?: LeadStatus;
  interest_type?: string;
}

export const LEAD_STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bgColor: string }> = {
  novo: { label: "Novos", color: "text-blue-700", bgColor: "bg-blue-100" },
  em_atendimento: { label: "Em Atendimento", color: "text-yellow-700", bgColor: "bg-yellow-100" },
  qualificado: { label: "Qualificados", color: "text-green-700", bgColor: "bg-green-100" },
  proposta: { label: "Proposta", color: "text-purple-700", bgColor: "bg-purple-100" },
  fechado: { label: "Fechados", color: "text-emerald-700", bgColor: "bg-emerald-100" },
  perdido: { label: "Perdidos", color: "text-red-700", bgColor: "bg-red-100" },
};

export const LEAD_STATUS_ORDER: LeadStatus[] = [
  "novo",
  "em_atendimento",
  "qualificado",
  "proposta",
  "fechado",
  "perdido",
];

export function useLeads(filters?: LeadFilters) {
  return useQuery({
    queryKey: ["leads", filters],
    queryFn: async () => {
      let query = supabase
        .from("leads")
        .select(`
          *,
          property_type:property_types(id, name)
        `)
        .order("created_at", { ascending: false });

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.interest_type) {
        query = query.eq("interest_type", filters.interest_type as "venda" | "locacao" | "ambos");
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useLead(id: string | undefined) {
  return useQuery({
    queryKey: ["lead", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("leads")
        .select(`
          *,
          property_type:property_types(id, name)
        `)
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lead: LeadInsert) => {
      const { data, error } = await supabase
        .from("leads")
        .insert(lead)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...lead }: LeadUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("leads")
        .update(lead)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead", data.id] });
    },
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadStatus }) => {
      const { data, error } = await supabase
        .from("leads")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("leads")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}
