

# Plano: Formulario de Imoveis + Funil de Vendas

## Visao Geral

Este plano implementa duas funcionalidades principais do CRM imobiliario:
1. **Formulario completo de cadastro de imoveis** com upload de fotos para Supabase Storage
2. **Funil de vendas visual** com drag-and-drop para gerenciamento de leads

## Pre-requisito Critico

Antes de implementar, o usuario precisa adicionar o script `build:dev` ao `package.json`:
```json
{
  "scripts": {
    "build:dev": "vite build --mode development"
  }
}
```

---

## Parte 1: Formulario de Cadastro de Imoveis

### 1.1 Estrutura Multi-Step (Wizard)

O formulario sera dividido em 4 etapas para melhor usabilidade:

```text
Etapa 1: Informacoes Basicas
- Titulo, codigo, tipo de imovel
- Finalidade (venda/locacao/ambos)
- Status (disponivel/vendido/locado/reservado)
- Descricao

Etapa 2: Localizacao
- CEP (com busca automatica)
- Endereco, numero, complemento
- Bairro, cidade, estado

Etapa 3: Caracteristicas
- Area total e util
- Quartos, suites, banheiros
- Vagas de garagem
- Preco venda/aluguel
- Condominio, IPTU

Etapa 4: Fotos e Proprietario
- Upload multiplo de fotos
- Galeria com preview
- Definir foto de capa
- Dados do proprietario
```

### 1.2 Componentes a Criar

**Arquivos novos:**
- `src/components/properties/PropertyForm.tsx` - Formulario principal multi-step
- `src/components/properties/PropertyFormStep1.tsx` - Informacoes basicas
- `src/components/properties/PropertyFormStep2.tsx` - Localizacao
- `src/components/properties/PropertyFormStep3.tsx` - Caracteristicas
- `src/components/properties/PropertyFormStep4.tsx` - Fotos e proprietario
- `src/components/properties/PhotoUploader.tsx` - Upload de fotos com drag-drop
- `src/components/properties/PhotoGallery.tsx` - Galeria com reordenacao
- `src/components/properties/PropertyCard.tsx` - Card para listagem
- `src/components/properties/PropertyFilters.tsx` - Filtros de busca
- `src/hooks/useProperties.ts` - Hook com queries e mutations
- `src/hooks/usePropertyPhotos.ts` - Hook para upload de fotos
- `src/pages/properties/NewPropertyPage.tsx` - Pagina de novo imovel
- `src/pages/properties/PropertyDetailsPage.tsx` - Detalhes do imovel

**Componentes UI necessarios:**
- `src/components/ui/dialog.tsx` - Modal
- `src/components/ui/select.tsx` - Select dropdown
- `src/components/ui/textarea.tsx` - Textarea
- `src/components/ui/tabs.tsx` - Tabs
- `src/components/ui/progress.tsx` - Barra de progresso
- `src/components/ui/badge.tsx` - Badges de status

### 1.3 Supabase Storage

**Migracao SQL necessaria:**
```sql
-- Criar bucket para fotos de imoveis
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-photos', 'property-photos', true);

-- Politica para usuarios autenticados fazerem upload
CREATE POLICY "Users can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-photos');

-- Politica para visualizacao publica
CREATE POLICY "Public can view photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-photos');

-- Politica para usuarios deletarem suas fotos
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'property-photos');
```

### 1.4 Fluxo de Upload de Fotos

```text
1. Usuario seleciona arquivos (max 10 por vez)
2. Preview local das imagens
3. Ao salvar, upload para Supabase Storage
4. URL salva na tabela property_photos
5. Reordenacao via drag-drop
6. Definir foto de capa
```

---

## Parte 2: Funil de Vendas Visual (Leads)

### 2.1 Estrutura do Funil

O funil tera colunas baseadas no status do lead (enum `lead_status`):

```text
NOVO -> CONTACTADO -> QUALIFICADO -> PROPOSTA -> NEGOCIACAO -> FECHADO -> PERDIDO
```

### 2.2 Componentes a Criar

**Arquivos novos:**
- `src/components/leads/LeadsFunnel.tsx` - Funil principal com colunas
- `src/components/leads/LeadColumn.tsx` - Coluna do funil
- `src/components/leads/LeadCard.tsx` - Card do lead (draggable)
- `src/components/leads/LeadForm.tsx` - Formulario de lead
- `src/components/leads/LeadDetails.tsx` - Modal com detalhes
- `src/hooks/useLeads.ts` - Hook com queries e mutations

### 2.3 Implementacao Drag-and-Drop

Usaremos a API nativa do HTML5 (sem biblioteca externa) para manter o bundle leve:

```text
Funcionalidades:
- Arrastar cards entre colunas
- Indicador visual de drop zone
- Animacao suave de transicao
- Atualizacao otimista no estado
- Sincronizacao com Supabase
```

### 2.4 Filtros e Busca

```text
- Busca por nome, email, telefone
- Filtro por tipo de interesse (venda/locacao)
- Filtro por tipo de imovel
- Filtro por responsavel
- Ordenacao por data
```

---

## Rotas a Adicionar

```text
/imoveis                 - Listagem de imoveis
/imoveis/novo            - Formulario de novo imovel
/imoveis/:id             - Detalhes do imovel
/imoveis/:id/editar      - Editar imovel

/leads                   - Funil de vendas
/leads/novo              - Modal de novo lead
/leads/:id               - Modal de detalhes
```

---

## Secao Tecnica

### Validacao com Zod

```typescript
// Schema de validacao do imovel
const propertySchema = z.object({
  title: z.string().min(3, "Titulo obrigatorio"),
  purpose: z.enum(["venda", "locacao", "ambos"]),
  status: z.enum(["disponivel", "vendido", "locado", "reservado"]),
  property_type_id: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  bedrooms: z.number().min(0).optional(),
  sale_price: z.number().positive().optional(),
  rent_price: z.number().positive().optional(),
});

// Schema de validacao do lead
const leadSchema = z.object({
  name: z.string().min(2, "Nome obrigatorio"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  interest_type: z.enum(["venda", "locacao", "ambos"]).optional(),
  budget_min: z.number().positive().optional(),
  budget_max: z.number().positive().optional(),
});
```

### TanStack Query Hooks

```typescript
// useProperties.ts
- useProperties() - Lista imoveis com filtros
- useProperty(id) - Busca imovel por ID
- useCreateProperty() - Mutation para criar
- useUpdateProperty() - Mutation para atualizar
- useDeleteProperty() - Mutation para deletar

// useLeads.ts
- useLeads() - Lista leads
- useLeadsByStatus() - Agrupa por status (funil)
- useCreateLead() - Mutation para criar
- useUpdateLeadStatus() - Mutation para mover no funil
```

### Upload de Fotos

```typescript
// usePropertyPhotos.ts
async function uploadPhoto(file: File, propertyId: string) {
  const fileName = `${propertyId}/${Date.now()}-${file.name}`;
  
  const { data, error } = await supabase.storage
    .from('property-photos')
    .upload(fileName, file);
    
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('property-photos')
    .getPublicUrl(fileName);
    
  // Salvar referencia na tabela property_photos
  await supabase.from('property_photos').insert({
    property_id: propertyId,
    url: publicUrl,
    order_index: 0,
  });
}
```

---

## Ordem de Implementacao

1. Adicionar script `build:dev` ao package.json (usuario)
2. Criar bucket `property-photos` no Supabase Storage
3. Criar componentes UI faltantes (dialog, select, textarea, etc)
4. Implementar hooks `useProperties` e `usePropertyPhotos`
5. Criar formulario multi-step de imoveis
6. Implementar upload de fotos com galeria
7. Atualizar pagina de listagem de imoveis
8. Implementar hook `useLeads`
9. Criar componentes do funil de vendas
10. Implementar drag-and-drop entre colunas
11. Criar formulario de leads
12. Adicionar rotas no App.tsx
13. Testar fluxos completos

---

## Resultado Final

Apos implementacao:
- Formulario completo de 4 etapas para cadastrar imoveis
- Upload de ate 10 fotos por imovel com galeria visual
- Busca automatica de CEP
- Funil de vendas Kanban com 7 colunas
- Drag-and-drop para mover leads entre etapas
- Filtros e busca em ambos os modulos
- Integracao completa com Supabase

