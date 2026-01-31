import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useUserRealEstate() {
  return useQuery({
    queryKey: ["user-real-estate"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .select("real_estate_id")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data?.real_estate_id;
    },
  });
}
