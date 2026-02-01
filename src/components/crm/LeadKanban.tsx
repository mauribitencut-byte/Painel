import { useState } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { LeadColumn } from "./LeadColumn";
import { useLeads, useUpdateLeadStatus, LEAD_STATUS_ORDER, type LeadStatus } from "@/hooks/useLeads";
import { toast } from "sonner";


interface LeadKanbanProps {
  search?: string;
  onLeadClick?: (leadId: string) => void;
}

export function LeadKanban({ search, onLeadClick }: LeadKanbanProps) {
  const { data: leads = [], isLoading } = useLeads({ search });
  const updateStatus = useUpdateLeadStatus();
  
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<LeadStatus | null>(null);

  // Group leads by status
  const leadsByStatus = LEAD_STATUS_ORDER.reduce((acc, status) => {
    acc[status] = leads.filter((lead) => lead.status === status);
    return acc;
  }, {} as Record<LeadStatus, typeof leads>);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.effectAllowed = "move";
    setDraggedLeadId(leadId);
  };

  const handleDragOver = (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget(status);
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: LeadStatus) => {
    e.preventDefault();
    
    if (draggedLeadId) {
      const lead = leads.find((l) => l.id === draggedLeadId);
      
      if (lead && lead.status !== newStatus) {
        try {
          await updateStatus.mutateAsync({ id: draggedLeadId, status: newStatus });
          toast.success("Status do lead atualizado!");
        } catch (error) {
          toast.error("Erro ao atualizar status do lead");
        }
      }
    }
    
    setDraggedLeadId(null);
    setDropTarget(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-4 pb-4">
        {LEAD_STATUS_ORDER.map((status) => (
          <LeadColumn
            key={status}
            status={status}
            leads={leadsByStatus[status]}
            isDropTarget={dropTarget === status}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
            onDragStart={handleDragStart}
            onLeadClick={onLeadClick}
          />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
