
# Plano: Correcao de Build + Funil de Vendas + Detalhes de Imoveis

## 1. Correcao Urgente - Erro de Build

O erro de build ocorre porque o arquivo `postcss.config.js` esta configurado para Tailwind CSS v4, mas o projeto usa Tailwind v3.

### Arquivo a Corrigir

```javascript
// postcss.config.js - ATUAL (incorreto)
export default {
  plugins: {
    "@tailwindcss/postcss": {},  // Tailwind v4
    autoprefixer: {},
  },
};

// postcss.config.js - CORRIGIDO
export default {
  plugins: {
    tailwindcss: {},  // Tailwind v3
    autoprefixer: {},
  },
};
```

---

## 2. Funil de Vendas com Drag-and-Drop

### Visao Geral

Um quadro Kanban visual onde os leads sao organizados em colunas por status, permitindo arrastar cards entre colunas para atualizar o status.

### Colunas do Funil (baseado no enum lead_status)

| Coluna | Status | Cor |
|--------|--------|-----|
| Novos | novo | Azul |
| Em Atendimento | em_atendimento | Amarelo |
| Qualificados | qualificado | Verde |
| Proposta | proposta | Roxo |
| Fechados | fechado | Verde escuro |
| Perdidos | perdido | Vermelho |

### Arquivos a Criar

```text
src/hooks/
  useLeads.ts              - CRUD de leads com TanStack Query

src/components/crm/
  LeadKanban.tsx           - Container do Kanban
  LeadColumn.tsx           - Coluna individual
  LeadCard.tsx             - Card do lead (arrastravel)
  LeadForm.tsx             - Formulario de cadastro/edicao
  LeadFilters.tsx          - Filtros de busca
```

### Fluxo de Interacao

```text
Usuario arrasta card
    |
    v
onDragStart -> salva lead_id e status original
    |
    v
onDragOver -> destaca coluna destino
    |
    v
onDrop -> identifica nova coluna
    |
    v
Mutation -> atualiza lead.status no banco
    |
    v
Invalidate query -> recarrega lista
```

### Implementacao Drag-and-Drop Nativo

```typescript
// LeadCard.tsx
<div
  draggable
  onDragStart={(e) => {
    e.dataTransfer.setData("leadId", lead.id);
    e.dataTransfer.setData("fromStatus", lead.status);
  }}
>
  {/* Card content */}
</div>

// LeadColumn.tsx
<div
  onDragOver={(e) => e.preventDefault()}
  onDrop={(e) => {
    const leadId = e.dataTransfer.getData("leadId");
    updateLeadStatus({ id: leadId, status: columnStatus });
  }}
>
  {leads.map(lead => <LeadCard key={lead.id} lead={lead} />)}
</div>
```

---

## 3. Pagina de Detalhes do Imovel

### Rota Nova

```text
/imoveis/:id -> PropertyDetailsPage
```

### Layout da Pagina

```text
+--------------------------------------------------+
|  [Voltar]                      [Editar] [Excluir] |
+--------------------------------------------------+
|                                                   |
|  +---------------------+  +--------------------+  |
|  |                     |  | Titulo             |  |
|  |   Galeria de Fotos  |  | Tipo | Status      |  |
|  |   (carrossel)       |  | Preco              |  |
|  |                     |  +--------------------+  |
|  +---------------------+  | Endereco           |  |
|                           | Mapa               |  |
|  +--------------------+   +--------------------+  |
|  | Thumbnails         |   | Caracteristicas    |  |
|  +--------------------+   | - Quartos          |  |
|                           | - Banheiros        |  |
|  +--------------------+   | - Vagas            |  |
|  | Descricao          |   +--------------------+  |
|  |                    |   | Proprietario       |  |
|  +--------------------+   | Nome | Tel | Email |  |
+--------------------------------------------------+
```

### Arquivos a Criar

```text
src/pages/properties/
  PropertyDetailsPage.tsx   - Pagina de detalhes

src/components/properties/
  PropertyGallery.tsx       - Galeria com thumbnails
  PropertyInfo.tsx          - Informacoes principais
  PropertyFeatures.tsx      - Caracteristicas
  PropertyOwner.tsx         - Dados do proprietario
```

---

## 4. Edicao de Imoveis

### Comportamento

1. Clicar no card da lista -> abre pagina de detalhes
2. Clicar em "Editar" -> abre modal com formulario preenchido
3. Formulario reutiliza os mesmos componentes (PropertyFormStep1-4)
4. Ao salvar, usa mutation `useUpdateProperty`

### Alteracoes no PropertyForm

```typescript
interface PropertyFormProps {
  property?: Property;  // Se existir, e edicao
  onSuccess: () => void;
  onCancel: () => void;
}

// Preencher valores iniciais
const form = useForm({
  defaultValues: property ? {
    title: property.title,
    code: property.code,
    // ... demais campos
  } : defaultValues
});

// Usar mutation correta
const mutation = property 
  ? useUpdateProperty() 
  : useCreateProperty();
```

---

## 5. Ordem de Implementacao

### Fase 1 - Correcao Urgente
1. Corrigir postcss.config.js

### Fase 2 - Funil de Vendas
2. Criar useLeads.ts com queries e mutations
3. Criar LeadCard.tsx com drag-and-drop
4. Criar LeadColumn.tsx como drop target
5. Criar LeadKanban.tsx orquestrando colunas
6. Criar LeadForm.tsx para cadastro
7. Atualizar LeadsPage.tsx com Kanban

### Fase 3 - Detalhes e Edicao
8. Criar PropertyDetailsPage.tsx
9. Criar PropertyGallery.tsx
10. Adicionar rota /imoveis/:id
11. Modificar PropertyForm para suportar edicao
12. Conectar click do card a pagina de detalhes

---

## 6. Secao Tecnica

### Hook useLeads

```typescript
export function useLeads(filters?: LeadFilters) {
  return useQuery({
    queryKey: ["leads", filters],
    queryFn: async () => {
      let query = supabase
        .from("leads")
        .select(`
          *,
          property_type:property_types(id, name),
          assigned_to_user:profiles!leads_assigned_to_fkey(full_name)
        `)
        .order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadStatus }) => {
      const { data, error } = await supabase
        .from("leads")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}
```

### Lead Status Type

```typescript
type LeadStatus = 
  | "novo" 
  | "em_atendimento" 
  | "qualificado" 
  | "proposta" 
  | "fechado" 
  | "perdido";

const statusConfig: Record<LeadStatus, { label: string; color: string }> = {
  novo: { label: "Novo", color: "bg-blue-500" },
  em_atendimento: { label: "Em Atendimento", color: "bg-yellow-500" },
  qualificado: { label: "Qualificado", color: "bg-green-500" },
  proposta: { label: "Proposta", color: "bg-purple-500" },
  fechado: { label: "Fechado", color: "bg-emerald-600" },
  perdido: { label: "Perdido", color: "bg-red-500" },
};
```

### Drag-and-Drop Events

```typescript
// Estado de drag global
const [draggedLead, setDraggedLead] = useState<string | null>(null);
const [dropTarget, setDropTarget] = useState<LeadStatus | null>(null);

// Handlers
const handleDragStart = (e: DragEvent, leadId: string) => {
  e.dataTransfer.effectAllowed = "move";
  setDraggedLead(leadId);
};

const handleDragOver = (e: DragEvent, status: LeadStatus) => {
  e.preventDefault();
  setDropTarget(status);
};

const handleDrop = (e: DragEvent, newStatus: LeadStatus) => {
  e.preventDefault();
  if (draggedLead) {
    updateStatus.mutate({ id: draggedLead, status: newStatus });
  }
  setDraggedLead(null);
  setDropTarget(null);
};
```

---

## 7. Resultado Esperado

Ao final da implementacao:

- Build funcionando sem erros
- Funil de vendas visual com 6 colunas
- Drag-and-drop para mover leads entre estagios
- Pagina de detalhes do imovel com galeria de fotos
- Edicao de imoveis atraves de modal no formulario existente
- Navegacao entre lista, detalhes e edicao
