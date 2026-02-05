import { Building2, Users, FileText, TrendingUp } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { StatCard } from "@/components/dashboard/StatCard";
import { LeadsDistribution } from "@/components/dashboard/LeadsDistribution";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { LeadAlerts } from "@/components/crm/LeadAlerts";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do seu CRM Imobiliário
        </p>
      </div>

      {/* Stats Grid com dados reais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <StatCard key={stat.title} {...stat} isLoading={isLoading} />
        ))}
      </div>

      {/* Distribuição de Leads */}
      <LeadsDistribution data={stats?.leadsByStatus} isLoading={isLoading} />

      {/* Lead Alerts */}
      <LeadAlerts />

      {/* Grid com Atividade Recente */}
      <div className="grid gap-4 md:grid-cols-2">
        <RecentActivity />
      </div>
    </div>
  );
}
