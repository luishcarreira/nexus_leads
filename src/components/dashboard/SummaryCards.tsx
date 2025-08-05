import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Globe,
  Search,
  UserCheck,
  UserX,
  TrendingUp,
  Users,
  Target,
  Clock,
  CheckCircle,
} from "lucide-react";
import { LeadsTotaisDetailsModal } from "./LeadsTotaisDetailsModal";
import { LeadsPorOrigemModal } from "./LeadsPorOrigemModal";
import { LeadsPorTipoProcuraModal } from "./LeadsPorTipoProcuraModal";
import {
  ILeadTotal,
  ILeadsTotaisDetalhados,
  ITotalPorOrigemDetalhado,
  ITotalPorTipoProcuraDetalhado,
} from "@/services/interfaces/ILead";

interface PaginacaoOutput<T> {
  total: number;
  pagina: number;
  limite: number;
  total_paginas: number;
  dados: T[];
}

interface ILeadResumo {
  id: number;
  nome: string;
  telefone?: string;
  email?: string;
  cidade?: string;
  uf?: string;
  data_criacao?: string;
  vendedor?: string;
  consultor?: string;
  situacao?: string;
  origem?: string;
  procura_para?: string;
}

interface TotalPorOrigem {
  origem: string;
  total: number;
  leads: PaginacaoOutput<ILeadResumo>;
}

interface TotalPorTipoProcura {
  tipo_procura: string;
  total: number;
  leads: PaginacaoOutput<ILeadResumo>;
}

interface TotalTransferidos {
  total: number;
  leads: PaginacaoOutput<ILeadResumo>;
}

interface TotalNaoTransferidos {
  total: number;
  leads: PaginacaoOutput<ILeadResumo>;
}

// Removendo interface duplicada - usando a do arquivo de interfaces

interface SummaryCardsProps {
  data: ILeadsTotaisDetalhados | null;
  loading?: boolean;
  onPageChange: {
    transferidos: (pagina: number) => void;
    naoTransferidos: (pagina: number) => void;
  };
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  data,
  loading = false,
  onPageChange,
}) => {
  const [detailsModalConfig, setDetailsModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    total: number;
    leads: PaginacaoOutput<ILeadResumo>;
    type: "origem" | "tipoProcura" | "transferidos" | "naoTransferidos";
    identifier?: string;
  }>({
    isOpen: false,
    title: "",
    total: 0,
    leads: { total: 0, pagina: 1, limite: 10, total_paginas: 0, dados: [] },
    type: "origem",
  });

  const [origemModalConfig, setOrigemModalConfig] = useState<{
    isOpen: boolean;
  }>({
    isOpen: false,
  });

  const [tipoProcuraModalConfig, setTipoProcuraModalConfig] = useState<{
    isOpen: boolean;
  }>({
    isOpen: false,
  });

  const handleCardClick = (
    type: "origem" | "tipoProcura" | "transferidos" | "naoTransferidos",
    title: string,
    identifier?: string
  ) => {
    if (!data) return;

    // Para origem, usar o novo modal específico
    if (type === "origem") {
      setOrigemModalConfig({
        isOpen: true,
      });
      return;
    }

    // Para tipo de procura, usar o novo modal específico
    if (type === "tipoProcura") {
      setTipoProcuraModalConfig({
        isOpen: true,
      });
      return;
    }

    let leads: PaginacaoOutput<ILeadResumo>;
    let total: number;

    switch (type) {
      case "transferidos":
        leads = data.transferidos.leads;
        total = data.transferidos.total;
        break;
      case "naoTransferidos":
        leads = data.nao_transferidos.leads;
        total = data.nao_transferidos.total;
        break;
      default:
        return;
    }

    setDetailsModalConfig({
      isOpen: true,
      title,
      total,
      leads,
      type,
      identifier,
    });
  };

  const handlePageChange = (page: number) => {
    const { type, identifier } = detailsModalConfig;
    switch (type) {
      case "transferidos":
        onPageChange.transferidos(page);
        break;
      case "naoTransferidos":
        onPageChange.naoTransferidos(page);
        break;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  console.log("Dados recebidos no SummaryCards:", data);
  console.log("Totais por origem:", data?.totais_por_origem);
  console.log("Totais por tipo procura:", data?.total_por_tipo_procura);

  const cards = [
    {
      title: "Total de Leads",
      value: data.total_leads,
      icon: Users,
      description: "Total geral de leads",
      gradient: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
      textColor: "text-blue-700",
      borderColor: "border-blue-200",
      shadowColor: "shadow-lg",
    },
    {
      title: "Leads por Origem",
      value:
        data?.totais_por_origem?.length > 0
          ? data.totais_por_origem.reduce(
              (sum, origem) => sum + origem.total,
              0
            )
          : 0,
      icon: Globe,
      description:
        data?.totais_por_origem?.length > 0
          ? `${data.totais_por_origem.length} origens diferentes`
          : "Sem dados",
      gradient: "from-emerald-500 to-green-600",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
      textColor: "text-emerald-700",
      borderColor: "border-emerald-200",
      shadowColor: "shadow-lg",
      onClick: () =>
        data?.totais_por_origem?.length > 0 &&
        handleCardClick("origem", "Leads por Origem"),
    },
    {
      title: "Por Tipo de Procura",
      value:
        data?.total_por_tipo_procura?.length > 0
          ? data.total_por_tipo_procura.reduce(
              (sum, tipo) => sum + tipo.total,
              0
            )
          : 0,
      icon: Search,
      description:
        data?.total_por_tipo_procura?.length > 0
          ? `${data.total_por_tipo_procura.length} tipos diferentes`
          : "Sem dados",
      gradient: "from-purple-500 to-purple-600",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-600",
      textColor: "text-purple-700",
      borderColor: "border-purple-200",
      shadowColor: "shadow-lg",
      onClick: () =>
        data?.total_por_tipo_procura?.length > 0 &&
        handleCardClick("tipoProcura", "Leads por Tipo de Procura"),
    },
    {
      title: "Transferidos",
      value: data?.transferidos?.total ?? 0,
      icon: UserCheck,
      description: "Para vendedores",
      gradient: "from-green-500 to-emerald-600",
      iconBg: "bg-green-500/10",
      iconColor: "text-green-600",
      textColor: "text-green-700",
      borderColor: "border-green-200",
      shadowColor: "shadow-lg",
      onClick: () => handleCardClick("transferidos", "Leads Transferidos"),
    },
    {
      title: "Não Transferidos",
      value: data?.nao_transferidos?.total ?? 0,
      icon: UserX,
      description: "Aguardando ação",
      gradient: "from-red-500 to-red-600",
      iconBg: "bg-red-500/10",
      iconColor: "text-red-600",
      textColor: "text-red-700",
      borderColor: "border-red-200",
      shadowColor: "shadow-lg",
      onClick: () =>
        handleCardClick("naoTransferidos", "Leads Não Transferidos"),
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {cards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Card
              key={index}
              className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                card.borderColor
              } ${card.shadowColor} ${card.onClick ? "cursor-pointer" : ""}`}
              onClick={card.onClick}
            >
              {/* Background gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
              />

              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle
                  className={`text-sm font-semibold ${card.textColor}`}
                >
                  {card.title}
                </CardTitle>
                <div
                  className={`p-3 rounded-xl ${card.iconBg} group-hover:scale-110 transition-transform duration-300`}
                >
                  <IconComponent className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className={`text-3xl font-bold ${card.textColor} mb-2`}>
                  {card.value.toLocaleString()}
                </div>
                <p
                  className={`text-xs font-medium ${card.textColor} opacity-80`}
                >
                  {card.description}
                </p>

                {/* Decorative element */}
                <div
                  className={`absolute bottom-2 right-2 w-8 h-8 rounded-full ${card.iconBg} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <LeadsTotaisDetailsModal
        isOpen={detailsModalConfig.isOpen}
        onClose={() =>
          setDetailsModalConfig((prev) => ({ ...prev, isOpen: false }))
        }
        title={detailsModalConfig.title}
        total={detailsModalConfig.total}
        leads={detailsModalConfig.leads as PaginacaoOutput<ILeadTotal>}
        onPageChange={handlePageChange}
        loading={loading}
      />

      <LeadsPorOrigemModal
        isOpen={origemModalConfig.isOpen}
        onClose={() =>
          setOrigemModalConfig((prev) => ({ ...prev, isOpen: false }))
        }
        totaisPorOrigem={data?.totais_por_origem || []}
        loading={loading}
      />

      <LeadsPorTipoProcuraModal
        isOpen={tipoProcuraModalConfig.isOpen}
        onClose={() =>
          setTipoProcuraModalConfig((prev) => ({ ...prev, isOpen: false }))
        }
        totaisPorTipoProcura={data?.total_por_tipo_procura || []}
        loading={loading}
      />
    </>
  );
};

// Componente para exibir detalhes dos cards em formato de lista
export const DetailedSummary: React.FC<{
  data: ILeadsTotaisDetalhados | null;
  loading?: boolean;
  onPageChange: {
    origem: (origem: string, pagina: number) => void;
    tipoProcura: (tipoProcura: string, pagina: number) => void;
  };
}> = ({ data, loading = false, onPageChange }) => {
  const [detailsModalConfig, setDetailsModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    total: number;
    leads: PaginacaoOutput<ILeadResumo>;
    type: "origem" | "tipoProcura";
    identifier: string;
  }>({
    isOpen: false,
    title: "",
    total: 0,
    leads: { total: 0, pagina: 1, limite: 10, total_paginas: 0, dados: [] },
    type: "origem",
    identifier: "",
  });

  const handleItemClick = (
    type: "origem" | "tipoProcura",
    title: string,
    total: number,
    leads: PaginacaoOutput<ILeadResumo>,
    identifier: string
  ) => {
    setDetailsModalConfig({
      isOpen: true,
      title,
      total,
      leads,
      type,
      identifier,
    });
  };

  const handlePageChange = (page: number) => {
    const { type, identifier } = detailsModalConfig;
    if (type === "origem") {
      onPageChange.origem(identifier, page);
    } else {
      onPageChange.tipoProcura(identifier, page);
    }
  };

  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="border-0 shadow-lg">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, itemIndex) => (
                <div
                  key={itemIndex}
                  className="flex justify-between items-center p-2"
                >
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-12 animate-pulse"></div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Detalhes por Origem */}
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-emerald-200">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600 opacity-5 group-hover:opacity-10 transition-opacity duration-300" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-sm font-semibold text-emerald-700 flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Globe className="h-5 w-5 text-emerald-600" />
              </div>
              Leads por Origem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 relative z-10">
            {data.totais_por_origem.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 bg-white/60 rounded-lg hover:bg-white/80 transition-colors cursor-pointer"
                onClick={() =>
                  handleItemClick(
                    "origem",
                    `Leads da Origem: ${item.origem}`,
                    item.total,
                    item.leads,
                    item.origem
                  )
                }
              >
                <span className="text-sm font-medium text-emerald-700">
                  {item.origem}
                </span>
                <span className="font-bold text-emerald-600 text-lg">
                  {item.total.toLocaleString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Detalhes por Tipo de Procura */}
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-purple-200">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 opacity-5 group-hover:opacity-10 transition-opacity duration-300" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-sm font-semibold text-purple-700 flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              Por Tipo de Procura
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 relative z-10">
            {data.total_por_tipo_procura.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 bg-white/60 rounded-lg hover:bg-white/80 transition-colors cursor-pointer"
                onClick={() =>
                  handleItemClick(
                    "tipoProcura",
                    `Leads do Tipo: ${item.tipo_procura}`,
                    item.total,
                    item.leads,
                    item.tipo_procura
                  )
                }
              >
                <span className="text-sm font-medium text-purple-700">
                  {item.tipo_procura}
                </span>
                <span className="font-bold text-purple-600 text-lg">
                  {item.total.toLocaleString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Status de Transferência */}
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-blue-200">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-5 group-hover:opacity-10 transition-opacity duration-300" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-sm font-semibold text-blue-700 flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              Status de Transferência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 relative z-10">
            <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
              <span className="text-sm font-medium text-blue-700 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Transferidos
              </span>
              <span className="font-bold text-green-600 text-lg">
                {data.transferidos.total.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
              <span className="text-sm font-medium text-blue-700 flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                Pendentes
              </span>
              <span className="font-bold text-orange-600 text-lg">
                {data.nao_transferidos.total.toLocaleString()}
              </span>
            </div>
            <div className="pt-3 border-t border-blue-200">
              <div className="flex justify-between items-center p-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <span className="text-sm font-semibold text-blue-800">
                  Taxa de Transferência
                </span>
                <span className="font-bold text-blue-600 text-lg">
                  {data.total_leads > 0
                    ? (
                        (data.transferidos.total / data.total_leads) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <LeadsTotaisDetailsModal
        isOpen={detailsModalConfig.isOpen}
        onClose={() =>
          setDetailsModalConfig((prev) => ({ ...prev, isOpen: false }))
        }
        title={detailsModalConfig.title}
        total={detailsModalConfig.total}
        leads={detailsModalConfig.leads as PaginacaoOutput<ILeadTotal>}
        onPageChange={handlePageChange}
        loading={loading}
      />
    </>
  );
};
