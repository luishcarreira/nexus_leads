import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, TrendingUp, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const statsCards = [
    {
      title: "Total de Leads",
      value: "1,234",
      description: "+12% em relação ao mês passado",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Conversões",
      value: "245",
      description: "+8% em relação ao mês passado",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Taxa de Conversão",
      value: "19.8%",
      description: "+2.1% em relação ao mês passado",
      icon: BarChart3,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="flex-1 space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral dos seus leads e performance
          </p>
        </div>
        <Button onClick={() => navigate("/leads")}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Lead
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimas atividades dos seus leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  action: "Novo lead criado",
                  lead: "João Silva",
                  time: "2 minutos atrás",
                },
                {
                  action: "Lead convertido",
                  lead: "Maria Santos",
                  time: "15 minutos atrás",
                },
                {
                  action: "Follow-up enviado",
                  lead: "Pedro Costa",
                  time: "1 hora atrás",
                },
                {
                  action: "Reunião agendada",
                  lead: "Ana Oliveira",
                  time: "2 horas atrás",
                },
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.lead}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso rápido às funcionalidades mais usadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/leads")}
              >
                <Users className="mr-2 h-4 w-4" />
                Ver todos os leads
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/leads")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar novo lead
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/users")}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Ver relatórios
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
