import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhotoUploader } from "./PhotoUploader";
import type { PropertyFormData } from "./PropertyForm";

interface PhotoFile {
  id?: string;
  file?: File;
  url: string;
  is_cover: boolean;
  uploading?: boolean;
}

interface PropertyFormStep4Props {
  form: UseFormReturn<PropertyFormData>;
  propertyId?: string;
  photos: PhotoFile[];
  onPhotosChange: (photos: PhotoFile[]) => void;
}

export function PropertyFormStep4({
  form,
  propertyId,
  photos,
  onPhotosChange,
}: PropertyFormStep4Props) {
  return (
    <div className="space-y-6">
      {/* Fotos */}
      <div>
        <h3 className="mb-3 text-sm font-medium">Fotos do Imóvel</h3>
        <PhotoUploader
          propertyId={propertyId}
          photos={photos}
          onPhotosChange={onPhotosChange}
          maxPhotos={10}
        />
      </div>

      {/* Proprietário */}
      <div>
        <h3 className="mb-3 text-sm font-medium">Dados do Proprietário</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="owner_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do proprietário" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="owner_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input
                    placeholder="(00) 00000-0000"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .replace(/(\d{2})(\d)/, "($1) $2")
                        .replace(/(\d{5})(\d)/, "$1-$2")
                        .slice(0, 15);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="owner_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
