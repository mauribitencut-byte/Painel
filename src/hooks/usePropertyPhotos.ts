import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type PropertyPhoto = Tables<"property_photos">;

export function usePropertyPhotos(propertyId: string | undefined) {
  return useQuery({
    queryKey: ["property-photos", propertyId],
    queryFn: async () => {
      if (!propertyId) return [];
      const { data, error } = await supabase
        .from("property_photos")
        .select("*")
        .eq("property_id", propertyId)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!propertyId,
  });
}

export function useUploadPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      propertyId,
      isCover = false,
      orderIndex = 0,
    }: {
      file: File;
      propertyId: string;
      isCover?: boolean;
      orderIndex?: number;
    }) => {
      // Sanitize filename
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileName = `${propertyId}/${Date.now()}-${sanitizedName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("property-photos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("property-photos")
        .getPublicUrl(fileName);

      // If setting as cover, unset other covers first
      if (isCover) {
        await supabase
          .from("property_photos")
          .update({ is_cover: false })
          .eq("property_id", propertyId);
      }

      // Insert into database
      const { data, error } = await supabase
        .from("property_photos")
        .insert({
          property_id: propertyId,
          url: publicUrl,
          is_cover: isCover,
          order_index: orderIndex,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["property-photos", data.property_id] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useDeletePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photo: PropertyPhoto) => {
      // Extract file path from URL
      const urlParts = photo.url.split("/property-photos/");
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from("property-photos").remove([filePath]);
      }

      // Delete from database
      const { error } = await supabase
        .from("property_photos")
        .delete()
        .eq("id", photo.id);

      if (error) throw error;
      return photo.property_id;
    },
    onSuccess: (propertyId) => {
      queryClient.invalidateQueries({ queryKey: ["property-photos", propertyId] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useSetCoverPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ photoId, propertyId }: { photoId: string; propertyId: string }) => {
      // Unset all covers for this property
      await supabase
        .from("property_photos")
        .update({ is_cover: false })
        .eq("property_id", propertyId);

      // Set new cover
      const { data, error } = await supabase
        .from("property_photos")
        .update({ is_cover: true })
        .eq("id", photoId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["property-photos", data.property_id] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}
