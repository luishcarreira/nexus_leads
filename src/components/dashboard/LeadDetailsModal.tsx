import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ILead } from "@/services/interfaces/ILead";
import { User, MapPin, Target, Globe, Calendar, Tag } from "lucide-react";

interface LeadDetailsModalProps {
  lead: ILead | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({
  lead,
  isOpen,
  onClose,
}) => {
  if (!lead) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSituacaoBadge = (situacao: string) => {
    const situacaoConfig = {
      "Novo Lead": {
        variant: "default" as const,
        className: "bg-blue-100 text-blue-800",
      },
      "Em Andamento": {
        variant: "secondary" as const,
        className: "bg-yellow-100 text-yellow-800",
      },
      Convertido: {
        variant: "default" as const,
        className: "bg-green-100 text-green-800",
      },
      Perdido: {
        variant: "destructive" as const,
        className: "bg-red-100 text-red-800",
      },
      Aguardando: {
        variant: "outline" as const,
        className: "bg-gray-100 text-gray-800",
      },
    };

    const config =
      situacaoConfig[situacao as keyof typeof situacaoConfig] ||
      situacaoConfig["Novo Lead"];

    return (
      <Badge variant={config.variant} className={config.className}>
        {situacao}
      </Badge>
    );
  };

  const InfoRow = ({
    label,
    value,
    className = "",
  }: {
    label: string;
    value: string | null;
    className?: string;
  }) => (
    <div className={`${className}`}>
      <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
      <p className="text-base text-foreground font-medium">
        {value || "Não informado"}
      </p>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-6 w-6" />
            {lead.nome}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {/* Informações Principais */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Principais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoRow label="Email" value={lead.email} />
              <InfoRow label="Telefone" value={lead.telefone} />
              <InfoRow label="Telefone Tratado" value={lead.telefone_tratado} />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Situação
                </p>
                <div>{getSituacaoBadge(lead.situacao)}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Localização */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Localização
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoRow label="UF" value={lead.uf} />
              <InfoRow label="Cidade" value={lead.cidade} />
            </div>
          </div>

          <Separator />

          {/* Informações de Negócio */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Informações de Negócio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoRow label="Procura Para" value={lead.procura_para} />
              <InfoRow
                label="Data Prevista de Aquisição"
                value={lead.data_prevista_aquisicao}
              />
              <InfoRow
                label="Tem Academia/Projeto"
                value={lead.tem_academia_projeto}
              />
              <InfoRow label="Melhor Horário" value={lead.melhor_horario} />
              <InfoRow label="Como Contatar" value={lead.como_contatar} />
              <InfoRow label="Tem Ponto" value={lead.tem_ponto} />
            </div>
          </div>

          <Separator />

          {/* Campanha e Marketing */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Campanha e Marketing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoRow label="Plataforma" value={lead.plataforma} />
              <InfoRow label="Formulário" value={lead.formulario} />
              <InfoRow label="Campanha" value={lead.campanha} />
              <InfoRow
                label="Conjunto de Anúncio"
                value={lead.conjunto_anuncio}
              />
              <InfoRow label="Origem" value={lead.origem} />
            </div>
          </div>

          <Separator />

          {/* Status e Responsáveis */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Status e Responsáveis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoRow label="Consultor" value={lead.consultor} />
              <InfoRow label="Vendedor" value={lead.vendedor} />
              <InfoRow label="ID Cliente" value={lead.id_cliente.toString()} />
              <InfoRow
                label="Último Pedido"
                value={lead.ultimo_pedido.toString()}
              />
            </div>
          </div>

          <Separator />

          {/* Datas */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Datas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoRow
                label="Data de Criação"
                value={formatDate(lead.data_criacao)}
              />
              <InfoRow
                label="Data/Hora de Inclusão"
                value={formatDate(lead.data_hora_inclusao)}
              />
            </div>
          </div>

          <Separator />

          {/* Informações Técnicas */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Informações Técnicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoRow label="ID" value={lead.id.toString()} />
              <InfoRow label="ID Integração" value={lead.id_integracao} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
