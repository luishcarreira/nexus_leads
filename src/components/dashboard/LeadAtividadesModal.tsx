import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ILead } from "@/services/interfaces/ILead";
import { ILeadAtividade } from "@/services/interfaces/ILead";
import { httpClient } from "@/services/httpClient";
import {
  Calendar,
  Clock,
  FileText,
  Phone,
  MessageSquare,
  MapPin,
  RefreshCw,
  Loader2,
} from "lucide-react";

interface LeadAtividadesModalProps {
  lead: ILead | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LeadAtividadesModal: React.FC<LeadAtividadesModalProps> = ({
  lead,
  isOpen,
  onClose,
}) => {
  const [atividades, setAtividades] = useState<ILeadAtividade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAtividades = async () => {
    if (!lead) return;

    setLoading(true);
    setError(null);

    try {
      const atividadesData = await httpClient.getLeadAtividades(lead.id);
      setAtividades(atividadesData);
    } catch (err) {
      setError("Erro ao carregar atividades do lead");
      console.error("Erro ao buscar atividades:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && lead) {
      fetchAtividades();
    }
  }, [isOpen, lead]);

  const getTipoIcon = (tipo: number) => {
    switch (tipo) {
      case 1:
        return <Phone className="h-4 w-4" />;
      case 2:
        return <MessageSquare className="h-4 w-4" />;
      case 3:
        return <MapPin className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTipoLabel = (tipo: number) => {
    switch (tipo) {
      case 1:
        return "Ligação";
      case 2:
        return "Reunião";
      case 3:
        return "Visita";
      default:
        return "Outro";
    }
  };

  const getTipoBadgeVariant = (tipo: number) => {
    switch (tipo) {
      case 1:
        return "default";
      case 2:
        return "secondary";
      case 3:
        return "outline";
      default:
        return "destructive";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Atividades do Lead: {lead.nome}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAtividades}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Carregando atividades...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-600">
              <span>{error}</span>
            </div>
          ) : atividades.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mr-2" />
              <span>Nenhuma atividade encontrada para este lead</span>
            </div>
          ) : (
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4">
                {atividades.map((atividade) => (
                  <div
                    key={atividade.id}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getTipoIcon(atividade.tipo)}
                        <h4 className="font-semibold text-lg">
                          {atividade.assunto}
                        </h4>
                      </div>
                      <Badge
                        variant={getTipoBadgeVariant(atividade.tipo) as any}
                      >
                        {getTipoLabel(atividade.tipo)}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Detalhes
                        </p>
                        <p className="text-foreground">{atividade.detalhe}</p>
                      </div>

                      {(atividade.data_agenda || atividade.hora_agenda) && (
                        <div className="flex items-center gap-4 text-sm">
                          {atividade.data_agenda && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {formatDate(atividade.data_agenda)}
                              </span>
                            </div>
                          )}
                          {atividade.hora_agenda && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {formatTime(atividade.hora_agenda)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {atividade.detalhe_retorno && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Retorno
                          </p>
                          <p className="text-foreground bg-muted/50 p-2 rounded">
                            {atividade.detalhe_retorno}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
