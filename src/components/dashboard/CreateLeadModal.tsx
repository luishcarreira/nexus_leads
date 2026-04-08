import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Loader2 } from "lucide-react";

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (leadData: CriarLeadRapidoData) => void;
  loading?: boolean;
}

export interface CreateLeadData {
  nome: string;
  telefone: string;
  email: string;
  cidade: string;
  uf: string;
  origem: string;
  valor_investimento_previsto: string;
  tem_ponto: boolean;
  situacao: number;
  etapa: number;
  gestor: string;
  anuncio: string;
}

// Interface para o endpoint de criação rápida
export interface CriarLeadRapidoData {
  nome: string;
  telefone: string;
  cidade: string;
  uf: string;
  valor_investimento: number | null;
  tem_ponto: boolean;
  email?: string | null;
  origem?: string;
  gestor?: string;
  anuncio?: string;
}

export const CreateLeadModal: React.FC<CreateLeadModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateLeadData>({
    nome: "",
    telefone: "",
    email: "",
    cidade: "",
    uf: "",
    origem: "",
    valor_investimento_previsto: "",
    tem_ponto: false,
    situacao: 1, // Novo Lead
    etapa: 1, // Triagem
    gestor: "",
    anuncio: "",
  });

  const [errors, setErrors] = useState<Partial<CreateLeadData>>({});

  const ufs = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ];
  const origens = [
    "Whatsapp",
    "Whatsapp Vitally Orgânico",
    "Google",
    "Facebook",
  ];

  const handleInputChange = (
    field: keyof CreateLeadData,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpar erro do campo quando usuário começa a digitar
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateLeadData> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = "Telefone é obrigatório";
    } else if (!/^\(\d{2}\) \d{4,5}-\d{4}$/.test(formData.telefone)) {
      newErrors.telefone = "Telefone deve estar no formato (11) 99999-9999";
    }

    // Email é opcional; se preenchido, valida formato
    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Email inválido";
    }

    if (!formData.cidade.trim()) {
      newErrors.cidade = "Cidade é obrigatória";
    }

    if (!formData.uf) {
      newErrors.uf = "UF é obrigatória";
    }

    if (!formData.origem) {
      newErrors.origem = "Origem é obrigatória";
    }

    // Valor de investimento é opcional; se preenchido, valida formato
    if (formData.valor_investimento_previsto.trim()) {
      const valorNumerico = parseFloat(
        formData.valor_investimento_previsto
          .replace(/[R$\s]/g, "")
          .replace(/\./g, "")
          .replace(",", "."),
      );
      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        newErrors.valor_investimento_previsto =
          "Digite um valor monetário válido (ex: R$ 50.000,00)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Converter dados para o formato da API
      const apiData = convertToApiFormat(formData);
      onSubmit(apiData);
    }
  };

  const handleClose = () => {
    // Limpar formulário ao fechar
    setFormData({
      nome: "",
      telefone: "",
      email: "",
      cidade: "",
      uf: "",
      origem: "",
      valor_investimento_previsto: "",
      tem_ponto: false,
      situacao: 1,
      etapa: 1,
      gestor: "",
      anuncio: "",
    });
    setErrors({});
    onClose();
  };

  const formatPhone = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, "");

    // Aplica a máscara
    if (numbers.length <= 2) {
      return `(${numbers}`;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(
        6,
      )}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(
        7,
        11,
      )}`;
    }
  };

  // Função para formatar valores monetários
  const formatCurrency = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, "");

    if (numbers.length === 0) return "";

    // Converte para número e formata
    const number = parseInt(numbers);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(number / 100);
  };

  // Converter dados do formulário para o formato do endpoint
  const convertToApiFormat = (
    formData: CreateLeadData,
  ): CriarLeadRapidoData => {
    // Converter valor de investimento de string para number
    // Se não preenchido, enviar null
    let valorNumerico: number | null = null;
    if (formData.valor_investimento_previsto.trim()) {
      valorNumerico =
        parseFloat(
          formData.valor_investimento_previsto
            .replace(/[R$\s]/g, "")
            .replace(/\./g, "")
            .replace(",", "."),
        ) || 0;
    }

    // Converter tem_ponto para formato da API (S/N)
    const temPontoApi = formData.tem_ponto ? "S" : "N";

    return {
      nome: formData.nome,
      telefone: formData.telefone,
      cidade: formData.cidade,
      uf: formData.uf,
      valor_investimento: valorNumerico,
      tem_ponto: temPontoApi === "S" ? true : false,
      email: formData.email?.trim() ? formData.email.trim() : null,
      origem: formData.origem.trim(),
      gestor: formData.gestor?.trim() ? formData.gestor.trim() : undefined,
      anuncio: formData.anuncio?.trim() ? formData.anuncio.trim() : undefined,
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Novo Lead
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange("nome", e.target.value)}
              placeholder="Nome completo"
              className={errors.nome ? "border-red-500" : ""}
            />
            {errors.nome && (
              <p className="text-sm text-red-500">{errors.nome}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone *</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) =>
                handleInputChange("telefone", formatPhone(e.target.value))
              }
              placeholder="(11) 99999-9999"
              className={errors.telefone ? "border-red-500" : ""}
            />
            {errors.telefone && (
              <p className="text-sm text-red-500">{errors.telefone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (opcional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="email@exemplo.com"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cidade">Cidade *</Label>
            <Input
              id="cidade"
              value={formData.cidade}
              onChange={(e) => handleInputChange("cidade", e.target.value)}
              placeholder="Nome da cidade"
              className={errors.cidade ? "border-red-500" : ""}
            />
            {errors.cidade && (
              <p className="text-sm text-red-500">{errors.cidade}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="uf">UF *</Label>
            <Select
              value={formData.uf}
              onValueChange={(value) => handleInputChange("uf", value)}
            >
              <SelectTrigger className={errors.uf ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecione a UF" />
              </SelectTrigger>
              <SelectContent>
                {ufs.map((uf) => (
                  <SelectItem key={uf} value={uf}>
                    {uf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.uf && <p className="text-sm text-red-500">{errors.uf}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="origem">Origem *</Label>
            <Select
              value={formData.origem}
              onValueChange={(value) => handleInputChange("origem", value)}
            >
              <SelectTrigger className={errors.origem ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecione a origem" />
              </SelectTrigger>
              <SelectContent>
                {origens.map((origem) => (
                  <SelectItem key={origem} value={origem}>
                    {origem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.origem && (
              <p className="text-sm text-red-500">{errors.origem}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gestor">Gestor (opcional)</Label>
            <Input
              id="gestor"
              value={formData.gestor}
              onChange={(e) => handleInputChange("gestor", e.target.value)}
              placeholder="Nome do gestor"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="anuncio">Anúncio (opcional)</Label>
            <Input
              id="anuncio"
              value={formData.anuncio}
              onChange={(e) => handleInputChange("anuncio", e.target.value)}
              placeholder="Nome do anúncio"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor_investimento_previsto">
              Valor de Investimento Previsto (opcional)
            </Label>
            <Input
              id="valor_investimento_previsto"
              value={formData.valor_investimento_previsto}
              onChange={(e) =>
                handleInputChange(
                  "valor_investimento_previsto",
                  formatCurrency(e.target.value),
                )
              }
              placeholder="Ex: R$ 50.000,00"
              className={
                errors.valor_investimento_previsto ? "border-red-500" : ""
              }
            />
            {errors.valor_investimento_previsto && (
              <p className="text-sm text-red-500">
                {errors.valor_investimento_previsto}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 md:col-span-2">
            <Checkbox
              id="tem_ponto"
              checked={formData.tem_ponto}
              onCheckedChange={(checked) =>
                handleInputChange("tem_ponto", checked)
              }
            />
            <Label htmlFor="tem_ponto" className="text-sm font-medium">
              Tem Ponto?
            </Label>
          </div>

          <div className="pt-4 space-y-2 md:col-span-2">
            <p className="text-sm text-muted-foreground">
              <strong>Valores padrão:</strong>
            </p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Situação: Novo Lead</p>
              <p>• Etapa: Triagem</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 md:col-span-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Lead"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
