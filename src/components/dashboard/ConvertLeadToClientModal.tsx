import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ILead } from "@/services/interfaces/ILead";
import { useDropdowns } from "@/hooks/use-dropdowns";
import { User, Building2, Loader2 } from "lucide-react";

interface ConvertLeadToClientData {
  tipo: "fisica" | "juridica";
  documento: string; // CPF ou CNPJ
  uf: string;
  ddd: string;
  telefone: string;
  email: string;
  instagram: string;
  facebook: string;
  id_vendedor: number;
}

interface ConvertLeadToClientModalProps {
  lead: ILead | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ConvertLeadToClientData) => Promise<void>;
  loading?: boolean;
}

export const ConvertLeadToClientModal: React.FC<
  ConvertLeadToClientModalProps
> = ({ lead, isOpen, onClose, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState<ConvertLeadToClientData>({
    tipo: "fisica",
    documento: "",
    uf: "",
    ddd: "",
    telefone: "",
    email: "",
    instagram: "",
    facebook: "",
    id_vendedor: 0,
  });

  const { consultores, loading: dropdownsLoading } = useDropdowns();

  // Lista de vendedores (pode vir da API no futuro)
  const vendedores = [
    { id: 1, nome: "Pedro Souza" },
    { id: 2, nome: "Juliana Alves" },
    { id: 3, nome: "Ricardo Martins" },
    { id: 4, nome: "Fernanda Cruz" },
    { id: 5, nome: "Lucas Pereira" },
    { id: 6, nome: "Camila Santos" },
    { id: 7, nome: "Diego Pereira" },
    { id: 8, nome: "Beatriz Costa" },
  ];

  // Lista de UFs brasileiras
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

  const handleInputChange = (
    field: keyof ConvertLeadToClientData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id_vendedor === 0) {
      alert("Por favor, selecione um vendedor");
      return;
    }
    await onSubmit(formData);
  };

  const formatDocument = (value: string, tipo: "fisica" | "juridica") => {
    if (tipo === "fisica") {
      // Formatar CPF: 000.000.000-00
      const numbers = value.replace(/\D/g, "");
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else {
      // Formatar CNPJ: 00.000.000/0000-00
      const numbers = value.replace(/\D/g, "");
      return numbers.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5"
      );
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg -m-6 mb-6 p-6">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
            <div className="p-2 bg-white/20 rounded-lg">
              <User className="h-6 w-6" />
            </div>
            Converter Lead em Cliente
          </DialogTitle>
          <p className="text-blue-100 text-sm mt-2">
            Preencha os dados para converter este lead em um cliente
          </p>
        </DialogHeader>

        {lead && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
            <h4 className="font-semibold text-sm text-blue-800 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Dados do Lead Original
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/60 p-2 rounded-lg">
                <span className="font-medium text-blue-700">Nome:</span>
                <span className="ml-1 text-gray-700">{lead.nome}</span>
              </div>
              <div className="bg-white/60 p-2 rounded-lg">
                <span className="font-medium text-blue-700">Email:</span>
                <span className="ml-1 text-gray-700">{lead.email}</span>
              </div>
              <div className="bg-white/60 p-2 rounded-lg">
                <span className="font-medium text-blue-700">Telefone:</span>
                <span className="ml-1 text-gray-700">{lead.telefone}</span>
              </div>
              <div className="bg-white/60 p-2 rounded-lg">
                <span className="font-medium text-blue-700">UF:</span>
                <span className="ml-1 text-gray-700">{lead.uf}</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Pessoa */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-blue-800">
              Tipo de Pessoa *
            </Label>
            <RadioGroup
              value={formData.tipo}
              onValueChange={(value: "fisica" | "juridica") =>
                handleInputChange("tipo", value)
              }
              className="flex gap-6"
            >
              <div className="flex items-center space-x-3 p-3 border-2 border-blue-200 rounded-lg hover:border-blue-400 transition-colors">
                <RadioGroupItem
                  value="fisica"
                  id="fisica"
                  className="text-blue-600"
                />
                <Label
                  htmlFor="fisica"
                  className="flex items-center gap-2 cursor-pointer text-blue-700 font-medium"
                >
                  <User className="h-4 w-4" />
                  Pessoa Física
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border-2 border-blue-200 rounded-lg hover:border-blue-400 transition-colors">
                <RadioGroupItem
                  value="juridica"
                  id="juridica"
                  className="text-blue-600"
                />
                <Label
                  htmlFor="juridica"
                  className="flex items-center gap-2 cursor-pointer text-blue-700 font-medium"
                >
                  <Building2 className="h-4 w-4" />
                  Pessoa Jurídica
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* CPF/CNPJ */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-blue-800">
              {formData.tipo === "fisica" ? "CPF" : "CNPJ"} *
            </Label>
            <Input
              placeholder={
                formData.tipo === "fisica"
                  ? "000.000.000-00"
                  : "00.000.000/0000-00"
              }
              value={formData.documento}
              onChange={(e) => {
                const formatted = formatDocument(e.target.value, formData.tipo);
                handleInputChange("documento", formatted);
              }}
              maxLength={formData.tipo === "fisica" ? 14 : 18}
              required
              className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* UF */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-blue-800">UF *</Label>
            <Select
              value={formData.uf}
              onValueChange={(value) => handleInputChange("uf", value)}
            >
              <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
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
          </div>

          {/* DDD e Telefone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-blue-800">
                DDD *
              </Label>
              <Input
                placeholder="11"
                value={formData.ddd}
                onChange={(e) => {
                  const numbers = e.target.value.replace(/\D/g, "");
                  handleInputChange("ddd", numbers.slice(0, 2));
                }}
                maxLength={2}
                required
                className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-blue-800">
                Telefone *
              </Label>
              <Input
                placeholder="(11) 99999-9999"
                value={formData.telefone}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value);
                  handleInputChange("telefone", formatted);
                }}
                maxLength={15}
                required
                className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-blue-800">
              Email *
            </Label>
            <Input
              type="email"
              placeholder="cliente@exemplo.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
              className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Redes Sociais */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-blue-800">
                Instagram
              </Label>
              <Input
                placeholder="@usuario"
                value={formData.instagram}
                onChange={(e) => handleInputChange("instagram", e.target.value)}
                className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-blue-800">
                Facebook
              </Label>
              <Input
                placeholder="facebook.com/usuario"
                value={formData.facebook}
                onChange={(e) => handleInputChange("facebook", e.target.value)}
                className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Vendedor */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-blue-800">
              Vendedor *
            </Label>
            <Select
              value={formData.id_vendedor.toString()}
              onValueChange={(value) =>
                handleInputChange("id_vendedor", parseInt(value))
              }
            >
              <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Selecione um vendedor" />
              </SelectTrigger>
              <SelectContent>
                {vendedores.map((vendedor) => (
                  <SelectItem key={vendedor.id} value={vendedor.id.toString()}>
                    {vendedor.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-6 border-t border-blue-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || dropdownsLoading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Convertendo...
                </>
              ) : (
                "Converter em Cliente"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
