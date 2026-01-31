import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PropertyFormStep1 } from "./PropertyFormStep1";
import { PropertyFormStep2 } from "./PropertyFormStep2";
import { PropertyFormStep3 } from "./PropertyFormStep3";
import { PropertyFormStep4 } from "./PropertyFormStep4";
import { useCreateProperty, useUpdateProperty } from "@/hooks/useProperties";
import { useUploadPhoto } from "@/hooks/usePropertyPhotos";
import { useUserRealEstate } from "@/hooks/useUserRealEstate";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

const propertySchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  code: z.string().optional(),
  property_type_id: z.string().optional(),
  purpose: z.enum(["venda", "locacao", "ambos"]),
  status: z.enum(["disponivel", "vendido", "locado", "reservado", "inativo"]),
  description: z.string().optional(),
  zip_code: z.string().optional(),
  address: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  area_total: z.number().nullable().optional(),
  area_util: z.number().nullable().optional(),
  bedrooms: z.number().optional(),
  suites: z.number().optional(),
  bathrooms: z.number().optional(),
  parking_spaces: z.number().optional(),
  sale_price: z.number().nullable().optional(),
  rent_price: z.number().nullable().optional(),
  condominium_fee: z.number().nullable().optional(),
  iptu: z.number().nullable().optional(),
  owner_name: z.string().optional(),
  owner_phone: z.string().optional(),
  owner_email: z.string().email().optional().or(z.literal("")),
});

export type PropertyFormData = z.infer<typeof propertySchema>;

interface PhotoFile {
  id?: string;
  file?: File;
  url: string;
  is_cover: boolean;
  uploading?: boolean;
}

interface PropertyFormProps {
  property?: Tables<"properties"> & {
    photos?: { id: string; url: string; is_cover: boolean; order_index: number }[];
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const steps = [
  { title: "Informações Básicas", description: "Título, tipo e status" },
  { title: "Localização", description: "Endereço completo" },
  { title: "Características", description: "Áreas e valores" },
  { title: "Fotos e Proprietário", description: "Imagens e contato" },
];

export function PropertyForm({ property, onSuccess, onCancel }: PropertyFormProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [photos, setPhotos] = React.useState<PhotoFile[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { data: realEstateId } = useUserRealEstate();
  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty();
  const uploadPhoto = useUploadPhoto();

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: property?.title || "",
      code: property?.code || "",
      property_type_id: property?.property_type_id || undefined,
      purpose: property?.purpose || "ambos",
      status: property?.status || "disponivel",
      description: property?.description || "",
      zip_code: property?.zip_code || "",
      address: property?.address || "",
      number: property?.number || "",
      complement: property?.complement || "",
      neighborhood: property?.neighborhood || "",
      city: property?.city || "",
      state: property?.state || "",
      area_total: property?.area_total ? Number(property.area_total) : null,
      area_util: property?.area_util ? Number(property.area_util) : null,
      bedrooms: property?.bedrooms || 0,
      suites: property?.suites || 0,
      bathrooms: property?.bathrooms || 0,
      parking_spaces: property?.parking_spaces || 0,
      sale_price: property?.sale_price ? Number(property.sale_price) : null,
      rent_price: property?.rent_price ? Number(property.rent_price) : null,
      condominium_fee: property?.condominium_fee ? Number(property.condominium_fee) : null,
      iptu: property?.iptu ? Number(property.iptu) : null,
      owner_name: property?.owner_name || "",
      owner_phone: property?.owner_phone || "",
      owner_email: property?.owner_email || "",
    },
  });

  // Load existing photos
  React.useEffect(() => {
    if (property?.photos) {
      setPhotos(
        property.photos.map((p) => ({
          id: p.id,
          url: p.url,
          is_cover: p.is_cover || false,
        }))
      );
    }
  }, [property]);

  const nextStep = async () => {
    // Validate current step fields
    const stepFields: Record<number, (keyof PropertyFormData)[]> = {
      0: ["title", "purpose", "status"],
      1: [],
      2: [],
      3: [],
    };

    const fieldsToValidate = stepFields[currentStep];
    const isValid = await form.trigger(fieldsToValidate);

    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: PropertyFormData) => {
    if (!realEstateId) {
      toast.error("Erro: Imobiliária não encontrada");
      return;
    }

    setIsSubmitting(true);

    try {
      const propertyData = {
        ...data,
        real_estate_id: realEstateId,
        owner_email: data.owner_email || null,
      };

      let savedProperty;

      if (property?.id) {
        savedProperty = await updateProperty.mutateAsync({
          id: property.id,
          ...propertyData,
        });
        toast.success("Imóvel atualizado com sucesso!");
      } else {
        savedProperty = await createProperty.mutateAsync(propertyData);

        // Upload pending photos
        const pendingPhotos = photos.filter((p) => p.file && !p.id);
        for (let i = 0; i < pendingPhotos.length; i++) {
          const photo = pendingPhotos[i];
          if (photo.file) {
            await uploadPhoto.mutateAsync({
              file: photo.file,
              propertyId: savedProperty.id,
              isCover: photo.is_cover,
              orderIndex: i,
            });
          }
        }

        toast.success("Imóvel cadastrado com sucesso!");
      }

      onSuccess?.();
    } catch (error) {
      console.error("Erro ao salvar imóvel:", error);
      toast.error("Erro ao salvar imóvel");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressValue = ((currentStep + 1) / steps.length) * 100;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col">
        {/* Progress */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{steps[currentStep].title}</span>
            <span className="text-muted-foreground">
              Etapa {currentStep + 1} de {steps.length}
            </span>
          </div>
          <Progress value={progressValue} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {steps[currentStep].description}
          </p>
        </div>

        {/* Step Content */}
        <ScrollArea className="flex-1 pr-4">
          {currentStep === 0 && <PropertyFormStep1 form={form} />}
          {currentStep === 1 && <PropertyFormStep2 form={form} />}
          {currentStep === 2 && <PropertyFormStep3 form={form} />}
          {currentStep === 3 && (
            <PropertyFormStep4
              form={form}
              propertyId={property?.id}
              photos={photos}
              onPhotosChange={setPhotos}
            />
          )}
        </ScrollArea>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <div>
            {currentStep > 0 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                Anterior
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancelar
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button type="button" onClick={nextStep}>
                Próximo
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {property ? "Salvar Alterações" : "Cadastrar Imóvel"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}
