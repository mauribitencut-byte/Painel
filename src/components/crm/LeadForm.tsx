import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateLead, useUpdateLead, LEAD_STATUS_CONFIG, LEAD_STATUS_ORDER } from "@/hooks/useLeads";
import { usePropertyTypes } from "@/hooks/usePropertyTypes";
import { useUserRealEstate } from "@/hooks/useUserRealEstate";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

const leadSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  source: z.string().optional(),
  interest_type: z.enum(["venda", "locacao", "ambos"]).optional(),
  property_type_id: z.string().optional(),
  budget_min: z.number().nullable().optional(),
  budget_max: z.number().nullable().optional(),
  preferred_neighborhoods: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["novo", "em_atendimento", "qualificado", "proposta", "fechado", "perdido"]),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadFormProps {
  lead?: Tables<"leads">;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function LeadForm({ lead, onSuccess, onCancel }: LeadFormProps) {
  const { data: realEstateId } = useUserRealEstate();
  const { data: propertyTypes } = usePropertyTypes();
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: lead?.name || "",
      email: lead?.email || "",
      phone: lead?.phone || "",
      source: lead?.source || "",
      interest_type: lead?.interest_type || undefined,
      property_type_id: lead?.property_type_id || undefined,
      budget_min: lead?.budget_min ? Number(lead.budget_min) : null,
      budget_max: lead?.budget_max ? Number(lead.budget_max) : null,
      preferred_neighborhoods: lead?.preferred_neighborhoods || "",
      notes: lead?.notes || "",
      status: lead?.status || "novo",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: LeadFormData) => {
    if (!realEstateId) {
      toast.error("Erro: Imobiliária não encontrada");
      return;
    }

    try {
      const leadData = {
        ...data,
        real_estate_id: realEstateId,
        email: data.email || null,
      };

      if (lead?.id) {
        await updateLead.mutateAsync({ id: lead.id, ...leadData });
        toast.success("Lead atualizado com sucesso!");
      } else {
        await createLead.mutateAsync(leadData);
        toast.success("Lead cadastrado com sucesso!");
      }

      onSuccess?.();
    } catch (error) {
      console.error("Erro ao salvar lead:", error);
      toast.error("Erro ao salvar lead");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do lead" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input placeholder="(00) 00000-0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@exemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Origem</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Site, Indicação, Instagram" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="interest_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interesse</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="venda">Compra</SelectItem>
                    <SelectItem value="locacao">Locação</SelectItem>
                    <SelectItem value="ambos">Compra e Locação</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="property_type_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Imóvel</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {propertyTypes?.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="budget_min"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Orçamento Mínimo</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="R$ 0"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="budget_max"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Orçamento Máximo</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="R$ 0"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="preferred_neighborhoods"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bairros de Preferência</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Centro, Zona Sul, Jardins" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LEAD_STATUS_ORDER.map((status) => (
                    <SelectItem key={status} value={status}>
                      {LEAD_STATUS_CONFIG[status].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Informações adicionais sobre o lead..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {lead ? "Salvar Alterações" : "Cadastrar Lead"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
