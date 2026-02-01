import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Bed,
  Bath,
  Car,
  Maximize,
  Phone,
  Mail,
  User,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PropertyGallery } from "@/components/properties/PropertyGallery";
import { PropertyForm } from "@/components/properties/PropertyForm";
import { useProperty, useDeleteProperty } from "@/hooks/useProperties";
import { toast } from "sonner";

const statusLabels: Record<string, string> = {
  disponivel: "Disponível",
  vendido: "Vendido",
  locado: "Locado",
  reservado: "Reservado",
  inativo: "Inativo",
};

const statusColors: Record<string, string> = {
  disponivel: "bg-green-100 text-green-800",
  vendido: "bg-blue-100 text-blue-800",
  locado: "bg-purple-100 text-purple-800",
  reservado: "bg-yellow-100 text-yellow-800",
  inativo: "bg-gray-100 text-gray-800",
};

const purposeLabels: Record<string, string> = {
  venda: "Venda",
  locacao: "Locação",
  ambos: "Venda e Locação",
};

export function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: property, isLoading } = useProperty(id);
  const deleteProperty = useDeleteProperty();

  const formatCurrency = (value: number | null) => {
    if (!value) return "—";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteProperty.mutateAsync(id);
      toast.success("Imóvel excluído com sucesso!");
      navigate("/imoveis");
    } catch (error) {
      toast.error("Erro ao excluir imóvel");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Imóvel não encontrado</h2>
        <Button className="mt-4" onClick={() => navigate("/imoveis")}>
          Voltar para lista
        </Button>
      </div>
    );
  }

  const fullAddress = [
    property.address,
    property.number,
    property.complement,
    property.neighborhood,
    property.city,
    property.state,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/imoveis")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{property.title}</h1>
            {property.code && (
              <p className="text-sm text-muted-foreground">Código: {property.code}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir imóvel?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. O imóvel e todas as suas fotos serão
                  removidos permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Gallery */}
        <div className="lg:col-span-2 space-y-6">
          <PropertyGallery photos={property.photos || []} />

          {/* Description */}
          {property.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Descrição</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {property.description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Info */}
        <div className="space-y-6">
          {/* Status & Price Card */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className={statusColors[property.status]}>
                  {statusLabels[property.status]}
                </Badge>
                <Badge variant="outline">{purposeLabels[property.purpose]}</Badge>
                {property.property_type?.name && (
                  <Badge variant="secondary">{property.property_type.name}</Badge>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                {property.sale_price && (
                  <div>
                    <p className="text-sm text-muted-foreground">Venda</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(Number(property.sale_price))}
                    </p>
                  </div>
                )}
                {property.rent_price && (
                  <div>
                    <p className="text-sm text-muted-foreground">Locação</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(Number(property.rent_price))}
                      <span className="text-sm font-normal text-muted-foreground">/mês</span>
                    </p>
                  </div>
                )}
              </div>

              {(property.condominium_fee || property.iptu) && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {property.condominium_fee && (
                      <div>
                        <p className="text-muted-foreground">Condomínio</p>
                        <p className="font-medium">
                          {formatCurrency(Number(property.condominium_fee))}
                        </p>
                      </div>
                    )}
                    {property.iptu && (
                      <div>
                        <p className="text-muted-foreground">IPTU</p>
                        <p className="font-medium">
                          {formatCurrency(Number(property.iptu))}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Features Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Características</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {property.area_total && (
                <div className="flex items-center gap-2">
                  <Maximize className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Área Total</p>
                    <p className="font-medium">{Number(property.area_total)} m²</p>
                  </div>
                </div>
              )}
              {property.area_util && (
                <div className="flex items-center gap-2">
                  <Maximize className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Área Útil</p>
                    <p className="font-medium">{Number(property.area_util)} m²</p>
                  </div>
                </div>
              )}
              {(property.bedrooms ?? 0) > 0 && (
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Quartos</p>
                    <p className="font-medium">
                      {property.bedrooms}
                      {(property.suites ?? 0) > 0 && ` (${property.suites} suítes)`}
                    </p>
                  </div>
                </div>
              )}
              {(property.bathrooms ?? 0) > 0 && (
                <div className="flex items-center gap-2">
                  <Bath className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Banheiros</p>
                    <p className="font-medium">{property.bathrooms}</p>
                  </div>
                </div>
              )}
              {(property.parking_spaces ?? 0) > 0 && (
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Vagas</p>
                    <p className="font-medium">{property.parking_spaces}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location Card */}
          {fullAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Localização</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-sm">{fullAddress}</p>
                </div>
                {property.zip_code && (
                  <p className="text-sm text-muted-foreground mt-1 ml-6">
                    CEP: {property.zip_code}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Owner Card */}
          {(property.owner_name || property.owner_phone || property.owner_email) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Proprietário</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {property.owner_name && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{property.owner_name}</span>
                  </div>
                )}
                {property.owner_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{property.owner_phone}</span>
                  </div>
                )}
                {property.owner_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{property.owner_email}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>Editar Imóvel</DialogTitle>
          </DialogHeader>
          <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
            <PropertyForm
              property={{
                ...property,
                photos: property.photos?.map(p => ({
                  id: p.id,
                  url: p.url,
                  is_cover: p.is_cover ?? false,
                  order_index: p.order_index ?? 0,
                })),
              }}
              onSuccess={() => setIsEditOpen(false)}
              onCancel={() => setIsEditOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
