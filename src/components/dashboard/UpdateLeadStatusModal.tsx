import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ILead, IEtapaLead, ISituacaoLead } from "@/services/interfaces/ILead";
import { User, Target, Calendar, Loader2 } from "lucide-react";

interface UpdateLeadStatusModalProps {
  lead: ILead | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (idEtapa: number, idSituacao: number) => void;
  loading?: boolean;
  etapas: IEtapaLead[];
  situacoes: ISituacaoLead[];
}

export const UpdateLeadStatusModal: React.FC<UpdateLeadStatusModalProps> = ({
  lead,
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  etapas,
  situacoes,
}) => {
  const [selectedEtapa, setSelectedEtapa] = useState<number | null>(null);
  const [selectedSituacao, setSelectedSituacao] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEtapa && selectedSituacao) {
      onSubmit(selectedEtapa, selectedSituacao);
    }
  };

  const handleClose = () => {
    setSelectedEtapa(null);
    setSelectedSituacao(null);
    onClose();
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

    const config = situacaoConfig[situacao as keyof typeof situacaoConfig] || {
      variant: "outline" as const,
      className: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge variant={config.variant} className={config.className}>
        {situacao}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Não informado";
    try {
      return new Date(dateString).toLocaleDateString("pt-BR");
    } catch {
      return dateString;
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Atualizar Etapa e Situação
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informações atuais do lead */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Lead #{lead.id}</span>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Nome</p>
              <p className="text-base font-medium">{lead.nome}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Data de Criação
              </p>
              <p className="text-sm">{formatDate(lead.data_criacao)}</p>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Situação Atual
              </p>
              {getSituacaoBadge(lead.situacao)}
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Etapa Atual</p>
              <p className="text-sm font-medium">
                {lead.procura_para || "Não informado"}
              </p>
            </div>
          </div>

          <Separator />

          {/* Seleção de nova etapa e situação */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground">
              Selecionar Nova Configuração
            </p>

            <div className="space-y-2">
              <Label htmlFor="nova-situacao">Nova Situação *</Label>
              <Select
                value={selectedSituacao?.toString() || ""}
                onValueChange={(value) => setSelectedSituacao(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha a nova situação" />
                </SelectTrigger>
                <SelectContent>
                  {situacoes.map((situacao) => (
                    <SelectItem
                      key={situacao.id}
                      value={situacao.id.toString()}
                    >
                      {situacao.descricao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nova-etapa">Nova Etapa *</Label>
              <Select
                value={selectedEtapa?.toString() || ""}
                onValueChange={(value) => setSelectedEtapa(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha a nova etapa" />
                </SelectTrigger>
                <SelectContent>
                  {etapas.map((etapa) => (
                    <SelectItem key={etapa.id} value={etapa.id.toString()}>
                      {etapa.descricao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedEtapa || !selectedSituacao}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                "Atualizar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
