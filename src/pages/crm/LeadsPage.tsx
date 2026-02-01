import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LeadKanban } from "@/components/crm/LeadKanban";
import { LeadForm } from "@/components/crm/LeadForm";
import { useDebounce } from "@/hooks/useDebounce";

export function LeadsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingLeadId(null);
  };

  const handleLeadClick = (leadId: string) => {
    setEditingLeadId(leadId);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Funil de Vendas</h1>
          <p className="text-muted-foreground">
            Gerencie seus leads arrastando entre as etapas
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Lead
        </Button>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Kanban Board */}
      <LeadKanban
        search={debouncedSearch || undefined}
        onLeadClick={handleLeadClick}
      />

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) setEditingLeadId(null);
      }}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLeadId ? "Editar Lead" : "Novo Lead"}
            </DialogTitle>
          </DialogHeader>
          <LeadForm
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingLeadId(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
