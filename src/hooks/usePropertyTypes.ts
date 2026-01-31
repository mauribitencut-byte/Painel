import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePropertyTypes() {
  return useQuery({
    queryKey: ["property-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_types")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}
