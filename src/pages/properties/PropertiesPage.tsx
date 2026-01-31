import { useState, useMemo } from "react";
import { Building2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { PropertyFilters } from "@/components/properties/PropertyFilters";
import { PropertyForm } from "@/components/properties/PropertyForm";
import { useProperties } from "@/hooks/useProperties";
import { useDebounce } from "@/hooks/useDebounce";

export function PropertiesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [propertyTypeId, setPropertyTypeId] = useState("all");
  const [purpose, setPurpose] = useState("all");
  const [status, setStatus] = useState("all");

  const debouncedSearch = useDebounce(search, 300);

  const filters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      property_type_id: propertyTypeId !== "all" ? propertyTypeId : undefined,
      purpose: purpose !== "all" ? purpose : undefined,
      status: status !== "all" ? status : undefined,
    }),
    [debouncedSearch, propertyTypeId, purpose, status]
  );

  const { data: properties, isLoading } = useProperties(filters);

  const handleFormSuccess = () => {
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Imóveis</h1>
          <p className="text-muted-foreground">
            Gerencie seu portfólio de imóveis
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Imóvel
        </Button>
      </div>

      {/* Filters */}
      <PropertyFilters
        search={search}
        onSearchChange={setSearch}
        propertyTypeId={propertyTypeId}
        onPropertyTypeChange={setPropertyTypeId}
        purpose={purpose}
        onPurposeChange={setPurpose}
        status={status}
        onStatusChange={setStatus}
      />

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!properties || properties.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">
              Nenhum imóvel encontrado
            </h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {search || propertyTypeId !== "all" || purpose !== "all" || status !== "all"
                ? "Tente ajustar os filtros de busca."
                : "Comece cadastrando seu primeiro imóvel."}
            </p>
            {!search && propertyTypeId === "all" && purpose === "all" && status === "all" && (
              <Button className="mt-4" onClick={() => setIsFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar Imóvel
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Property Grid */}
      {!isLoading && properties && properties.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onClick={() => {
                // TODO: Open edit modal or navigate to details
              }}
            />
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>Novo Imóvel</DialogTitle>
          </DialogHeader>
          <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
            <PropertyForm
              onSuccess={handleFormSuccess}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
