import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePropertyTypes } from "@/hooks/usePropertyTypes";

interface PropertyFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  propertyTypeId: string;
  onPropertyTypeChange: (value: string) => void;
  purpose: string;
  onPurposeChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
}

const purposeOptions = [
  { value: "all", label: "Todas finalidades" },
  { value: "venda", label: "Venda" },
  { value: "locacao", label: "Locação" },
  { value: "ambos", label: "Venda e Locação" },
];

const statusOptions = [
  { value: "all", label: "Todos status" },
  { value: "disponivel", label: "Disponível" },
  { value: "vendido", label: "Vendido" },
  { value: "locado", label: "Locado" },
  { value: "reservado", label: "Reservado" },
  { value: "inativo", label: "Inativo" },
];

export function PropertyFilters({
  search,
  onSearchChange,
  propertyTypeId,
  onPropertyTypeChange,
  purpose,
  onPurposeChange,
  status,
  onStatusChange,
}: PropertyFiltersProps) {
  const { data: propertyTypes = [] } = usePropertyTypes();

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por título, código ou endereço..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Type Filter */}
      <Select value={propertyTypeId} onValueChange={onPropertyTypeChange}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos tipos</SelectItem>
          {propertyTypes.map((type) => (
            <SelectItem key={type.id} value={type.id}>
              {type.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Purpose Filter */}
      <Select value={purpose} onValueChange={onPurposeChange}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Finalidade" />
        </SelectTrigger>
        <SelectContent>
          {purposeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
