import { Building2, Users, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    title: "Imóveis Ativos",
    value: "0",
    description: "Disponíveis para venda/locação",
    icon: Building2,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    title: "Leads",
    value: "0",
    description: "Aguardando atendimento",
    icon: Users,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    title: "Contratos Ativos",
    value: "0",
    description: "Locações em andamento",
    icon: FileText,
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
  {
    title: "Faturamento",
    value: "R$ 0",
    description: "Este mês",
    icon: TrendingUp,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do seu CRM Imobiliário
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Nenhuma atividade recente. Configure as tabelas no Supabase para começar.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              1. Configure as tabelas do banco de dados
            </p>
            <p className="text-sm text-muted-foreground">
              2. Cadastre seus primeiros imóveis
            </p>
            <p className="text-sm text-muted-foreground">
              3. Adicione leads e comece a gerenciar
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
