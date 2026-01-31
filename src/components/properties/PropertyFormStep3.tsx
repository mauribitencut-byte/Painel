import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { PropertyFormData } from "./PropertyForm";

interface PropertyFormStep3Props {
  form: UseFormReturn<PropertyFormData>;
}

export function PropertyFormStep3({ form }: PropertyFormStep3Props) {
  const purpose = form.watch("purpose");

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const amount = parseInt(numbers, 10) / 100;
    return amount.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const parseCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return parseInt(numbers, 10) / 100 || 0;
  };

  return (
    <div className="space-y-6">
      {/* Áreas */}
      <div>
        <h3 className="mb-3 text-sm font-medium">Áreas</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="area_total"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Área Total (m²)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value) || null)}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="area_util"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Área Útil (m²)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value) || null)}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Características */}
      <div>
        <h3 className="mb-3 text-sm font-medium">Características</h3>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <FormField
            control={form.control}
            name="bedrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quartos</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="suites"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Suítes</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bathrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banheiros</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parking_spaces"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vagas</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Valores */}
      <div>
        <h3 className="mb-3 text-sm font-medium">Valores</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {(purpose === "venda" || purpose === "ambos") && (
            <FormField
              control={form.control}
              name="sale_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço de Venda</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="R$ 0,00"
                      value={field.value ? formatCurrency(String(field.value * 100)) : ""}
                      onChange={(e) => {
                        const value = parseCurrency(e.target.value);
                        field.onChange(value || null);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {(purpose === "locacao" || purpose === "ambos") && (
            <FormField
              control={form.control}
              name="rent_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor do Aluguel</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="R$ 0,00"
                      value={field.value ? formatCurrency(String(field.value * 100)) : ""}
                      onChange={(e) => {
                        const value = parseCurrency(e.target.value);
                        field.onChange(value || null);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="condominium_fee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condomínio</FormLabel>
                <FormControl>
                  <Input
                    placeholder="R$ 0,00"
                    value={field.value ? formatCurrency(String(field.value * 100)) : ""}
                    onChange={(e) => {
                      const value = parseCurrency(e.target.value);
                      field.onChange(value || null);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="iptu"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IPTU (anual)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="R$ 0,00"
                    value={field.value ? formatCurrency(String(field.value * 100)) : ""}
                    onChange={(e) => {
                      const value = parseCurrency(e.target.value);
                      field.onChange(value || null);
                    }}
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
