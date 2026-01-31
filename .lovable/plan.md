

# Plano: Formulario de Cadastro de Imoveis com Upload de Fotos

## Resumo

Implementar um formulario completo de 4 etapas para cadastro de imoveis, com upload de fotos para o Supabase Storage, listagem com filtros e cards visuais.

---

## O Que Sera Criado

### Formulario Multi-Step (4 Etapas)

**Etapa 1 - Informacoes Basicas:**
- Titulo do imovel
- Codigo de referencia
- Tipo de imovel (Apartamento, Casa, Comercial, Terreno)
- Finalidade (Venda, Locacao, Ambos)
- Status (Disponivel, Vendido, Locado, Reservado, Inativo)
- Descricao detalhada

**Etapa 2 - Localizacao:**
- CEP com busca automatica (API ViaCEP)
- Endereco, numero e complemento
- Bairro, cidade e estado
- Preenchimento automatico ao digitar o CEP

**Etapa 3 - Caracteristicas e Valores:**
- Area total e util (m2)
- Quartos, suites, banheiros, vagas
- Preco de venda e aluguel
- Taxa de condominio e IPTU

**Etapa 4 - Fotos e Proprietario:**
- Upload de ate 10 fotos
- Galeria com preview das imagens
- Opcao para definir foto de capa
- Dados do proprietario (nome, telefone, email)

### Listagem de Imoveis

- Cards visuais com foto de capa
- Informacoes principais (titulo, preco, localizacao)
- Filtros por tipo, finalidade e status
- Busca por texto
- Link para cadastrar novo imovel

---

## Arquivos a Criar

```text
src/hooks/
  useProperties.ts          - Queries e mutations para imoveis
  usePropertyPhotos.ts      - Upload de fotos para Storage
  usePropertyTypes.ts       - Lista tipos de imoveis

src/components/ui/
  dialog.tsx                - Modal
  select.tsx                - Dropdown select
  textarea.tsx              - Campo de texto longo
  progress.tsx              - Barra de progresso
  badge.tsx                 - Badges de status

src/components/properties/
  PropertyForm.tsx          - Formulario principal multi-step
  PropertyFormStep1.tsx     - Etapa 1: Informacoes basicas
  PropertyFormStep2.tsx     - Etapa 2: Localizacao
  PropertyFormStep3.tsx     - Etapa 3: Caracteristicas
  PropertyFormStep4.tsx     - Etapa 4: Fotos e proprietario
  PhotoUploader.tsx         - Upload de fotos com drag-drop
  PhotoGallery.tsx          - Galeria com preview
  PropertyCard.tsx          - Card para listagem
  PropertyFilters.tsx       - Filtros de busca
```

---

## Fluxo de Navegacao

```text
/imoveis           -> Lista de imoveis
    [+] Novo Imovel -> Abre modal com formulario 4 etapas
    [Card] Clique   -> Abre detalhes/edicao
```

---

## Recursos do Banco Utilizados

O banco ja possui toda a estrutura necessaria:

- **Tabela `properties`**: 30+ campos incluindo titulo, endereco, precos, caracteristicas, dados do proprietario
- **Tabela `property_photos`**: url, is_cover, order_index, property_id
- **Tabela `property_types`**: Apartamento, Casa, Comercial, Terreno
- **Bucket `property-photos`**: Storage publico para fotos
- **Enums**: property_purpose (venda/locacao/ambos), property_status (disponivel/vendido/locado/reservado/inativo)
- **RLS**: Politicas ja configuradas para usuarios autenticados

---

## Secao Tecnica

### Validacao com Zod

```typescript
const propertySchema = z.object({
  title: z.string().min(3, "Titulo obrigatorio"),
  purpose: z.enum(["venda", "locacao", "ambos"]),
  status: z.enum(["disponivel", "vendido", "locado", "reservado", "inativo"]),
  property_type_id: z.string().optional(),
  // ... demais campos
});
```

### Upload de Fotos para Storage

```typescript
async function uploadPhoto(file: File, propertyId: string) {
  const fileName = `${propertyId}/${Date.now()}-${file.name}`;
  
  const { data, error } = await supabase.storage
    .from('property-photos')
    .upload(fileName, file);
    
  const { data: { publicUrl } } = supabase.storage
    .from('property-photos')
    .getPublicUrl(fileName);
    
  await supabase.from('property_photos').insert({
    property_id: propertyId,
    url: publicUrl,
    is_cover: false,
    order_index: 0,
  });
}
```

### TanStack Query Hooks

```typescript
// useProperties.ts
useProperties(filters)      // Lista com filtros
useProperty(id)            // Busca por ID
useCreateProperty()        // Mutation criar
useUpdateProperty()        // Mutation atualizar
useDeleteProperty()        // Mutation deletar

// usePropertyPhotos.ts
usePropertyPhotos(propertyId)  // Lista fotos
useUploadPhoto()               // Upload para Storage
useDeletePhoto()               // Remove foto
useSetCoverPhoto()             // Define capa
```

### Busca de CEP (ViaCEP)

```typescript
async function fetchAddress(cep: string) {
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  const data = await response.json();
  return {
    address: data.logradouro,
    neighborhood: data.bairro,
    city: data.localidade,
    state: data.uf,
  };
}
```

---

## Ordem de Implementacao

1. Criar componentes UI faltantes (dialog, select, textarea, progress, badge)
2. Criar hooks de dados (useProperties, usePropertyPhotos, usePropertyTypes)
3. Implementar componentes do formulario (steps 1-4)
4. Criar PhotoUploader e PhotoGallery
5. Montar PropertyForm com navegacao entre etapas
6. Criar PropertyCard e PropertyFilters
7. Atualizar PropertiesPage com listagem e modal
8. Adicionar rotas no App.tsx
9. Testar fluxo completo

---

## Resultado Esperado

Ao final:
- Formulario de 4 etapas funcional com validacao
- Upload de fotos para Supabase Storage
- Busca automatica de endereco por CEP
- Listagem de imoveis com cards e filtros
- Integracao completa com banco de dados existente

