import { Building2, MapPin, Bed, Car, Bath, SquareIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

type Property = Tables<"properties"> & {
  property_type?: { id: string; name: string } | null;
  photos?: { id: string; url: string; is_cover: boolean | null; order_index: number | null }[];
};

interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
}

const statusColors = {
  disponivel: "success",
  vendido: "destructive",
  locado: "secondary",
  reservado: "warning",
  inativo: "outline",
} as const;

const statusLabels = {
  disponivel: "Disponível",
  vendido: "Vendido",
  locado: "Locado",
  reservado: "Reservado",
  inativo: "Inativo",
};

const purposeLabels = {
  venda: "Venda",
  locacao: "Locação",
  ambos: "Venda/Locação",
};

export function PropertyCard({ property, onClick }: PropertyCardProps) {
  const coverPhoto = property.photos?.find((p) => p.is_cover) || property.photos?.[0];

  const formatCurrency = (value: number | null) => {
    if (!value) return null;
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const getMainPrice = () => {
    if (property.purpose === "venda" || property.purpose === "ambos") {
      if (property.sale_price) {
        return { value: formatCurrency(Number(property.sale_price)), label: "" };
      }
    }
    if (property.purpose === "locacao" || property.purpose === "ambos") {
      if (property.rent_price) {
        return { value: formatCurrency(Number(property.rent_price)), label: "/mês" };
      }
    }
    return null;
  };

  const mainPrice = getMainPrice();

  return (
    <Card
      className={cn(
        "group overflow-hidden transition-all hover:shadow-lg",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {coverPhoto ? (
          <img
            src={coverPhoto.url}
            alt={property.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Building2 className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          <Badge variant={statusColors[property.status]}>
            {statusLabels[property.status]}
          </Badge>
          <Badge variant="secondary">{purposeLabels[property.purpose]}</Badge>
        </div>

        {/* Code */}
        {property.code && (
          <div className="absolute right-2 top-2">
            <Badge variant="outline" className="bg-background/80">
              {property.code}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Title and Type */}
        <div className="mb-2">
          <h3 className="line-clamp-1 font-semibold">{property.title}</h3>
          {property.property_type && (
            <p className="text-sm text-muted-foreground">
              {property.property_type.name}
            </p>
          )}
        </div>

        {/* Location */}
        {(property.neighborhood || property.city) && (
          <div className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="line-clamp-1">
              {[property.neighborhood, property.city].filter(Boolean).join(", ")}
            </span>
          </div>
        )}

        {/* Features */}
        <div className="mb-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
          {property.area_total && (
            <div className="flex items-center gap-1">
              <SquareIcon className="h-3.5 w-3.5" />
              <span>{property.area_total} m²</span>
            </div>
          )}
          {property.bedrooms !== null && property.bedrooms > 0 && (
            <div className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms !== null && property.bathrooms > 0 && (
            <div className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          {property.parking_spaces !== null && property.parking_spaces > 0 && (
            <div className="flex items-center gap-1">
              <Car className="h-3.5 w-3.5" />
              <span>{property.parking_spaces}</span>
            </div>
          )}
        </div>

        {/* Price */}
        {mainPrice && (
          <div className="border-t pt-3">
            <span className="text-lg font-bold text-primary">
              {mainPrice.value}
            </span>
            {mainPrice.label && (
              <span className="text-sm text-muted-foreground">{mainPrice.label}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
