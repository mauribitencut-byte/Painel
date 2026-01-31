import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert, TablesUpdate, Enums } from "@/integrations/supabase/types";

type PropertyInsert = TablesInsert<"properties">;
type PropertyUpdate = TablesUpdate<"properties">;

interface PropertyFilters {
  search?: string;
  property_type_id?: string;
  purpose?: string;
  status?: string;
}

export function useProperties(filters?: PropertyFilters) {
  return useQuery({
    queryKey: ["properties", filters],
    queryFn: async () => {
      let query = supabase
        .from("properties")
        .select(`
          *,
          property_type:property_types(id, name),
          photos:property_photos(id, url, is_cover, order_index)
        `)
        .order("created_at", { ascending: false });

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,code.ilike.%${filters.search}%,address.ilike.%${filters.search}%`);
      }
      if (filters?.property_type_id) {
        query = query.eq("property_type_id", filters.property_type_id);
      }
      if (filters?.purpose) {
        query = query.eq("purpose", filters.purpose as Enums<"property_purpose">);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status as Enums<"property_status">);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useProperty(id: string | undefined) {
  return useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          property_type:property_types(id, name),
          photos:property_photos(id, url, is_cover, order_index, title)
        `)
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (property: PropertyInsert) => {
      const { data, error } = await supabase
        .from("properties")
        .insert(property)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...property }: PropertyUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("properties")
        .update(property)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["property", data.id] });
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}
