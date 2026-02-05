

# Plano: Graficos de Evolucao Mensal no Dashboard

## Resumo

Adicionar dois graficos ao Dashboard mostrando a evolucao historica dos ultimos 6 meses:
1. Grafico de linhas mostrando quantidade de leads por mes
2. Grafico de barras mostrando faturamento mensal

---

## O Que Sera Criado

### Grafico de Evolucao de Leads

Grafico de linha mostrando:
- Quantidade de leads novos por mes
- Quantidade de leads fechados por mes
- Quantidade de leads perdidos por mes

### Grafico de Faturamento Mensal

Grafico de barras mostrando:
- Total de parcelas pagas por mes
- Cores diferenciadas para meses com bom/baixo desempenho

---

## Layout Visual

```text
+--------------------------------------------------+
|  Stats Cards (4 cards existentes)                 |
+--------------------------------------------------+
|  Distribuicao de Leads (existente)                |
+--------------------------------------------------+
|  +----------------------+  +--------------------+ |
|  |  Evolucao de Leads   |  | Faturamento Mensal | |
|  |  [Grafico de Linhas] |  | [Grafico de Barras]| |
|  |  6 meses             |  | 6 meses            | |
|  +----------------------+  +--------------------+ |
+--------------------------------------------------+
|  Lead Alerts (existente)                          |
+--------------------------------------------------+
|  Atividade Recente (existente)                    |
+--------------------------------------------------+
```

---

## Arquivos a Criar/Modificar

```text
src/hooks/
  useMonthlyStats.ts        - Hook para dados mensais (6 meses)

src/components/dashboard/
  LeadsEvolutionChart.tsx   - Grafico de evolucao de leads
  RevenueChart.tsx          - Grafico de faturamento mensal

src/pages/
  Dashboard.tsx             - Integrar novos graficos
```

---

## Fonte de Dados

### Leads por Mes

```sql
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) FILTER (WHERE status = 'novo') as novos,
  COUNT(*) FILTER (WHERE status = 'fechado') as fechados,
  COUNT(*) FILTER (WHERE status = 'perdido') as perdidos
FROM leads
WHERE created_at >= NOW() - INTERVAL '6 months'
GROUP BY month
ORDER BY month
```

### Faturamento por Mes

```sql
SELECT 
  DATE_TRUNC('month', payment_date) as month,
  SUM(paid_value) as total
FROM rental_installments
WHERE status = 'pago' 
  AND payment_date >= NOW() - INTERVAL '6 months'
GROUP BY month
ORDER BY month
```

---

## Secao Tecnica

### Hook useMonthlyStats

```typescript
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns";

interface MonthlyLeadStats {
  month: string;
  label: string;
  novos: number;
  fechados: number;
  perdidos: number;
  total: number;
}

interface MonthlyRevenueStats {
  month: string;
  label: string;
  revenue: number;
}

interface MonthlyStats {
  leads: MonthlyLeadStats[];
  revenue: MonthlyRevenueStats[];
}

export function useMonthlyStats() {
  return useQuery({
    queryKey: ["monthly-stats"],
    queryFn: async (): Promise<MonthlyStats> => {
      const now = new Date();
      const sixMonthsAgo = subMonths(startOfMonth(now), 5);

      // Buscar todos os leads dos ultimos 6 meses
      const { data: leads } = await supabase
        .from("leads")
        .select("created_at, status")
        .gte("created_at", sixMonthsAgo.toISOString());

      // Buscar todos os pagamentos dos ultimos 6 meses
      const { data: payments } = await supabase
        .from("rental_installments")
        .select("payment_date, paid_value")
        .eq("status", "pago")
        .gte("payment_date", sixMonthsAgo.toISOString());

      // Processar leads por mes
      const leadsPerMonth = processLeadsByMonth(leads ?? [], now);

      // Processar faturamento por mes
      const revenuePerMonth = processRevenueByMonth(payments ?? [], now);

      return {
        leads: leadsPerMonth,
        revenue: revenuePerMonth,
      };
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutos
  });
}

function processLeadsByMonth(leads: any[], now: Date): MonthlyLeadStats[] {
  const months: MonthlyLeadStats[] = [];

  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const monthKey = format(monthStart, "yyyy-MM");
    const label = format(monthDate, "MMM", { locale: ptBR });

    const monthLeads = leads.filter((lead) => {
      const createdAt = new Date(lead.created_at);
      return createdAt >= monthStart && createdAt <= monthEnd;
    });

    months.push({
      month: monthKey,
      label: label.charAt(0).toUpperCase() + label.slice(1),
      novos: monthLeads.filter((l) => l.status === "novo").length,
      fechados: monthLeads.filter((l) => l.status === "fechado").length,
      perdidos: monthLeads.filter((l) => l.status === "perdido").length,
      total: monthLeads.length,
    });
  }

  return months;
}

function processRevenueByMonth(payments: any[], now: Date): MonthlyRevenueStats[] {
  const months: MonthlyRevenueStats[] = [];

  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const monthKey = format(monthStart, "yyyy-MM");
    const label = format(monthDate, "MMM", { locale: ptBR });

    const monthPayments = payments.filter((p) => {
      if (!p.payment_date) return false;
      const paymentDate = new Date(p.payment_date);
      return paymentDate >= monthStart && paymentDate <= monthEnd;
    });

    const revenue = monthPayments.reduce(
      (sum, p) => sum + (p.paid_value || 0),
      0
    );

    months.push({
      month: monthKey,
      label: label.charAt(0).toUpperCase() + label.slice(1),
      revenue,
    });
  }

  return months;
}
```

### Componente LeadsEvolutionChart

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface LeadsEvolutionChartProps {
  data?: MonthlyLeadStats[];
  isLoading?: boolean;
}

export function LeadsEvolutionChart({ data, isLoading }: LeadsEvolutionChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Evolucao de Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="h-full w-full animate-pulse rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Evolucao de Leads</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="label" className="text-xs" />
            <YAxis allowDecimals={false} className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="total"
              name="Total"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6" }}
            />
            <Line
              type="monotone"
              dataKey="fechados"
              name="Fechados"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981" }}
            />
            <Line
              type="monotone"
              dataKey="perdidos"
              name="Perdidos"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: "#ef4444" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

### Componente RevenueChart

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface RevenueChartProps {
  data?: MonthlyRevenueStats[];
  isLoading?: boolean;
}

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Faturamento Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="h-full w-full animate-pulse rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular media para colorir barras
  const average = data?.reduce((sum, d) => sum + d.revenue, 0) / (data?.length || 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Faturamento Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="label" className="text-xs" />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              className="text-xs"
              width={80}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), "Faturamento"]}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
              }}
            />
            <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
              {data?.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.revenue >= average ? "#8b5cf6" : "#a78bfa"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

### Dashboard Atualizado

```typescript
import { useMonthlyStats } from "@/hooks/useMonthlyStats";
import { LeadsEvolutionChart } from "@/components/dashboard/LeadsEvolutionChart";
import { RevenueChart } from "@/components/dashboard/RevenueChart";

export function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: monthlyStats, isLoading: isLoadingMonthly } = useMonthlyStats();

  return (
    <div className="space-y-6">
      {/* ... Stats Cards e LeadsDistribution existentes ... */}

      {/* Graficos de Evolucao */}
      <div className="grid gap-4 md:grid-cols-2">
        <LeadsEvolutionChart
          data={monthlyStats?.leads}
          isLoading={isLoadingMonthly}
        />
        <RevenueChart
          data={monthlyStats?.revenue}
          isLoading={isLoadingMonthly}
        />
      </div>

      {/* Lead Alerts e Atividade Recente existentes */}
    </div>
  );
}
```

---

## Biblioteca de Graficos

O projeto ja tem `recharts` instalado (versao ^2.15.4) mas ainda nao esta sendo usado. Os componentes utilizarao:

- `LineChart` - para evolucao de leads
- `BarChart` - para faturamento mensal
- `ResponsiveContainer` - para responsividade
- `Tooltip` - informacoes ao passar o mouse
- `Legend` - legenda do grafico
- `CartesianGrid` - grade de fundo

---

## Ordem de Implementacao

1. Criar hook `useMonthlyStats` para buscar dados dos ultimos 6 meses
2. Criar componente `LeadsEvolutionChart` com grafico de linhas
3. Criar componente `RevenueChart` com grafico de barras
4. Integrar graficos no `Dashboard.tsx`
5. Adicionar estados de loading
6. Testar responsividade em diferentes tamanhos de tela

---

## Resultado Esperado

Ao final da implementacao:

- Dashboard exibe dois graficos lado a lado
- Grafico de leads mostra evolucao de 6 meses com 3 linhas (Total, Fechados, Perdidos)
- Grafico de faturamento mostra barras coloridas por desempenho vs media
- Tooltips informativos ao passar o mouse
- Estados de loading enquanto carrega dados
- Layout responsivo (empilha em mobile)
- Atualizacao automatica a cada 5 minutos

