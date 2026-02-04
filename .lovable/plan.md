

# Plano: Metricas Reais no Dashboard + Teste de Cadastro

## Resumo

Implementar metricas dinamicas no Dashboard que consultam dados reais do banco de dados, substituindo os valores estaticos atuais por contadores em tempo real.

---

## O Que Sera Implementado

### Metricas no Dashboard

| Metrica | Fonte de Dados | Calculo |
|---------|----------------|---------|
| Imoveis Ativos | `properties` | COUNT WHERE status = 'disponivel' |
| Leads | `leads` | COUNT WHERE status NOT IN ('fechado', 'perdido') |
| Contratos Ativos | `rentals` | COUNT WHERE status = 'ativo' |
| Faturamento Mes | `rental_installments` | SUM(paid_value) WHERE status = 'pago' AND payment_date no mes atual |

### Distribuicao de Leads por Status

Exibir grafico ou lista mostrando quantos leads estao em cada estagio do funil:
- Novos
- Em Atendimento
- Qualificados
- Proposta
- Fechados (este mes)
- Perdidos (este mes)

### Atividade Recente

Lista das ultimas 5 acoes no sistema:
- Imoveis cadastrados recentemente
- Leads criados/atualizados
- Parcelas pagas

---

## Arquivos a Criar/Modificar

```text
src/hooks/
  useDashboardStats.ts      - Hook para buscar todas as metricas

src/pages/
  Dashboard.tsx             - Atualizar para usar dados reais

src/components/dashboard/
  StatCard.tsx              - Componente reutilizavel para stats
  LeadsDistribution.tsx     - Distribuicao de leads por status
  RecentActivity.tsx        - Lista de atividades recentes
```

---

## Arquitetura de Dados

```text
Dashboard.tsx
    |
    +-> useDashboardStats()
           |
           +-> Query: properties (count disponivel)
           +-> Query: leads (count por status)
           +-> Query: rentals (count ativos)
           +-> Query: rental_installments (soma pagos no mes)
           |
           v
        { activeProperties, leads, activeRentals, monthlyRevenue }
```

---

## Secao Tecnica

### Hook useDashboardStats

```typescript
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth } from "date-fns";

interface DashboardStats {
  activeProperties: number;
  totalLeads: number;
  leadsByStatus: Record<string, number>;
  activeRentals: number;
  monthlyRevenue: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardStats> => {
      // Imoveis disponiveis
      const { count: activeProperties } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("status", "disponivel");

      // Leads (todos exceto fechado/perdido)
      const { data: leads } = await supabase
        .from("leads")
        .select("status");

      const leadsByStatus = leads?.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) ?? {};

      const totalLeads = leads?.filter(
        (l) => l.status !== "fechado" && l.status !== "perdido"
      ).length ?? 0;

      // Contratos ativos
      const { count: activeRentals } = await supabase
        .from("rentals")
        .select("*", { count: "exact", head: true })
        .eq("status", "ativo");

      // Faturamento do mes
      const now = new Date();
      const monthStart = startOfMonth(now).toISOString();
      const monthEnd = endOfMonth(now).toISOString();

      const { data: payments } = await supabase
        .from("rental_installments")
        .select("paid_value")
        .eq("status", "pago")
        .gte("payment_date", monthStart)
        .lte("payment_date", monthEnd);

      const monthlyRevenue = payments?.reduce(
        (sum, p) => sum + (p.paid_value || 0),
        0
      ) ?? 0;

      return {
        activeProperties: activeProperties ?? 0,
        totalLeads,
        leadsByStatus,
        activeRentals: activeRentals ?? 0,
        monthlyRevenue,
      };
    },
    refetchInterval: 60000, // Atualiza a cada minuto
  });
}
```

### Dashboard Atualizado

```typescript
export function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  const statsCards = [
    {
      title: "Imóveis Ativos",
      value: stats?.activeProperties ?? 0,
      description: "Disponíveis para venda/locação",
      icon: Building2,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Leads",
      value: stats?.totalLeads ?? 0,
      description: "Em andamento",
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Contratos Ativos",
      value: stats?.activeRentals ?? 0,
      description: "Locações em andamento",
      icon: FileText,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      title: "Faturamento",
      value: formatCurrency(stats?.monthlyRevenue ?? 0),
      description: "Este mês",
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid com dados reais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <StatCard key={stat.title} {...stat} isLoading={isLoading} />
        ))}
      </div>

      {/* Distribuicao de Leads */}
      <LeadsDistribution data={stats?.leadsByStatus} />

      {/* Lead Alerts (ja existe) */}
      <LeadAlerts />

      {/* Atividade Recente */}
      <RecentActivity />
    </div>
  );
}
```

### Componente LeadsDistribution

```typescript
function LeadsDistribution({ data }: { data?: Record<string, number> }) {
  const statusConfig = {
    novo: { label: "Novos", color: "bg-blue-500" },
    em_atendimento: { label: "Em Atendimento", color: "bg-yellow-500" },
    qualificado: { label: "Qualificados", color: "bg-green-500" },
    proposta: { label: "Proposta", color: "bg-purple-500" },
    fechado: { label: "Fechados", color: "bg-emerald-600" },
    perdido: { label: "Perdidos", color: "bg-red-500" },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição de Leads</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          {Object.entries(statusConfig).map(([status, config]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${config.color}`} />
              <span className="text-sm">
                {config.label}: {data?.[status] ?? 0}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Formatacao de Moeda

```typescript
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
```

---

## Ordem de Implementacao

1. Criar hook `useDashboardStats` com queries ao banco
2. Criar componente `StatCard` com estado de loading
3. Criar componente `LeadsDistribution`
4. Criar componente `RecentActivity`
5. Atualizar `Dashboard.tsx` para usar dados reais
6. Adicionar formatacao de moeda
7. Testar com dados existentes

---

## Teste de Cadastro de Imovel

Apos implementar as metricas, sera necessario testar manualmente:

1. Fazer login na aplicacao
2. Navegar para /imoveis
3. Clicar em "Novo Imovel"
4. Preencher as 4 etapas do formulario
5. Fazer upload de fotos
6. Salvar e verificar se aparece na listagem
7. Clicar no card para abrir a pagina de detalhes
8. Verificar se as fotos aparecem na galeria

O teste automatizado nao pode ser executado porque requer credenciais de login validas, que precisam ser fornecidas pelo usuario.

---

## Resultado Esperado

Ao final da implementacao:

- Dashboard exibe metricas reais do banco de dados
- Contadores atualizam automaticamente a cada minuto
- Distribuicao visual de leads por status
- Faturamento do mes calculado com base em parcelas pagas
- Cards com estado de loading enquanto carrega dados
- Formatacao correta de valores monetarios em Real (BRL)

