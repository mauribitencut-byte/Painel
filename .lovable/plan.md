
# Plano: Notificacoes e Lembretes para Follow-up de Leads

## Contexto

Leads parados em determinados estagios por muito tempo perdem oportunidades de conversao. Este sistema identificara automaticamente leads que precisam de atencao e exibira alertas visuais para a equipe agir.

---

## O Que Sera Criado

### Indicadores Visuais nos Cards

Cada LeadCard mostrara um indicador de tempo parado:
- Circulos coloridos indicando urgencia
- Tooltip com tempo exato desde ultima atualizacao

| Tempo Parado | Indicador | Cor |
|--------------|-----------|-----|
| < 24 horas | Verde | Recente |
| 1-3 dias | Amarelo | Atencao |
| 3-7 dias | Laranja | Urgente |
| > 7 dias | Vermelho | Critico |

### Secao de Alertas no Dashboard

Card com lista de leads que precisam de atencao imediata:
- Leads parados ha mais de 3 dias
- Ordenados por tempo parado (mais antigos primeiro)
- Link direto para cada lead

### Badge de Notificacao no Menu

Contador no menu lateral mostrando quantos leads precisam de follow-up:
- Numero vermelho ao lado de "Leads"
- Atualiza automaticamente com queries

---

## Arquivos a Criar/Modificar

```text
src/hooks/
  useStaleLeads.ts          - Query para leads parados

src/components/crm/
  LeadCard.tsx              - Adicionar indicador de tempo
  StaleLeadIndicator.tsx    - Componente do indicador visual
  LeadAlerts.tsx            - Lista de alertas

src/components/layout/
  DashboardLayout.tsx       - Badge de notificacao no menu

src/pages/
  Dashboard.tsx             - Secao de alertas
```

---

## Logica de Identificacao

Um lead e considerado "parado" baseado em:
1. Tempo desde `updated_at`
2. Status atual (alguns estagios tem tolerancias diferentes)

| Status | Tempo Critico |
|--------|---------------|
| novo | 24 horas |
| em_atendimento | 48 horas |
| qualificado | 72 horas |
| proposta | 5 dias |
| fechado | N/A |
| perdido | N/A |

---

## Fluxo de Exibicao

```text
Dashboard
    |
    +-> Card "Leads que Precisam de Atencao"
           |
           +-> Lista com avatar, nome, tempo parado, status
           +-> Click -> Abre detalhes do lead

Menu Lateral
    |
    +-> "Leads (3)" -> Badge vermelho com contador

Kanban
    |
    +-> Cada card tem circulo colorido indicando urgencia
```

---

## Secao Tecnica

### Hook useStaleLeads

```typescript
export function useStaleLeads() {
  return useQuery({
    queryKey: ["stale-leads"],
    queryFn: async () => {
      // Busca leads que nao estao fechados/perdidos
      const { data } = await supabase
        .from("leads")
        .select("*")
        .not("status", "in", "(fechado,perdido)")
        .order("updated_at", { ascending: true });

      return data?.filter((lead) => {
        const hoursSinceUpdate = differenceInHours(
          new Date(),
          new Date(lead.updated_at)
        );
        const threshold = getThresholdByStatus(lead.status);
        return hoursSinceUpdate > threshold;
      });
    },
    refetchInterval: 5 * 60 * 1000, // Atualiza a cada 5 min
  });
}

function getThresholdByStatus(status: LeadStatus): number {
  const thresholds = {
    novo: 24,
    em_atendimento: 48,
    qualificado: 72,
    proposta: 120,
    fechado: Infinity,
    perdido: Infinity,
  };
  return thresholds[status];
}
```

### Componente StaleLeadIndicator

```typescript
function StaleLeadIndicator({ updatedAt, status }: Props) {
  const hoursSince = differenceInHours(new Date(), new Date(updatedAt));
  const threshold = getThresholdByStatus(status);

  const getColor = () => {
    if (hoursSince < threshold * 0.5) return "bg-green-500";
    if (hoursSince < threshold) return "bg-yellow-500";
    if (hoursSince < threshold * 1.5) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <Tooltip>
      <TooltipTrigger>
        <span className={\`h-2 w-2 rounded-full \${getColor()}\`} />
      </TooltipTrigger>
      <TooltipContent>
        {formatDistanceToNow(new Date(updatedAt), { locale: ptBR })}
      </TooltipContent>
    </Tooltip>
  );
}
```

### Dashboard LeadAlerts

```typescript
function LeadAlerts() {
  const { data: staleLeads, isLoading } = useStaleLeads();

  if (!staleLeads?.length) return null;

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Leads que Precisam de Atenção ({staleLeads.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {staleLeads.slice(0, 5).map((lead) => (
          <LeadAlertItem key={lead.id} lead={lead} />
        ))}
      </CardContent>
    </Card>
  );
}
```

### Badge no Menu

```typescript
function SidebarLeadsItem() {
  const { data: staleLeads } = useStaleLeads();
  const count = staleLeads?.length || 0;

  return (
    <Link to="/leads">
      <span>Leads</span>
      {count > 0 && (
        <Badge variant="destructive" className="ml-auto">
          {count > 99 ? "99+" : count}
        </Badge>
      )}
    </Link>
  );
}
```

---

## Ordem de Implementacao

1. Criar hook `useStaleLeads` com logica de tempo
2. Criar componente `StaleLeadIndicator`
3. Adicionar indicador ao `LeadCard`
4. Criar componente `LeadAlerts`
5. Adicionar secao de alertas ao `Dashboard`
6. Modificar `DashboardLayout` para incluir badge
7. Adicionar dependencia `date-fns` (ja instalada)

---

## Resultado Esperado

Ao final:
- Cards de leads mostram indicador visual de urgencia
- Dashboard exibe lista de leads que precisam de atencao
- Menu lateral mostra badge com quantidade de leads parados
- Atualizacao automatica a cada 5 minutos
- Tooltips informativos com tempo exato

---

## Nota sobre Testes

Para testar o cadastro de imoveis com fotos e a pagina de detalhes, sera necessario fazer login na aplicacao. O teste automatizado falhou porque as credenciais fornecidas nao eram validas.

Apos a implementacao das notificacoes, voce podera:
1. Fazer login manualmente na aplicacao
2. Cadastrar um imovel com fotos usando o formulario de 4 etapas
3. Navegar para a pagina de detalhes clicando no card
4. Criar leads e observar os indicadores de tempo no Kanban
5. Verificar os alertas no Dashboard

