export interface ILead {
  id: number;
  id_integracao: string;
  nome: string;
  telefone: string;
  telefone_tratado: string;
  email: string;
  tem_ponto: string | null;
  data_criacao: string;
  plataforma: string;
  formulario: string;
  procura_para: string;
  data_prevista_aquisicao: string;
  tem_academia_projeto: string;
  melhor_horario: string;
  como_contatar: string;
  uf: string;
  cidade: string | null;
  campanha: string;
  conjunto_anuncio: string;
  data_hora_inclusao: string;
  situacao: string;
  id_cliente: number;
  ultimo_pedido: number;
  consultor: string | null;
  vendedor: string | null;
  origem: string;
  etapa: string;
}

export interface ILeadsResponse {
  data: ILead[];
  total: number;
}

export interface ILeadsFilters {
  email?: string;
  telefone?: string;
  nome?: string;
  data_criacao_inicio?: string;
  data_criacao_fim?: string;
  situacao?: string;
  origem?: string;
  tipo_procura?: string;
  uf?: string; // filtro por UF
  etapa?: string;
  id_consultor?: number;
  id_vendedor?: number;
  pagina?: number;
  limite?: number;
  order_by?: string;
  order_header?: string;
  transferido?: boolean | null; // Campo para filtrar transferidos/não transferidos
}

// Interfaces para os totais de leads
export interface ITotalPorOrigem {
  origem: string;
  total: number;
}

export interface ITotalPorTipoProcura {
  tipo_procura: string;
  total: number;
}

export interface ILeadsTotais {
  total_leads: number;
  total_por_origem: ITotalPorOrigem[];
  total_por_tipo_procura: ITotalPorTipoProcura[];
  total_transferidos: number;
  total_nao_transferidos: number;
}

// Interfaces para totais detalhados com leads
export interface ITotalPorOrigemDetalhado {
  origem: string;
  total: number;
  leads: {
    total: number;
    pagina: number;
    limite: number;
    total_paginas: number;
    dados: ILeadTotal[];
  };
}

export interface ITotalPorTipoProcuraDetalhado {
  tipo_procura: string;
  total: number;
  leads: {
    total: number;
    pagina: number;
    limite: number;
    total_paginas: number;
    dados: ILeadTotal[];
  };
}

export interface ILeadsTotaisDetalhados {
  total_leads: number;
  totais_por_origem: ITotalPorOrigemDetalhado[];
  total_por_tipo_procura: ITotalPorTipoProcuraDetalhado[];
  transferidos: {
    total: number;
    pagina: number;
    limite: number;
    total_paginas: number;
    dados: ILeadTotal[];
  };
  nao_transferidos: {
    total: number;
    pagina: number;
    limite: number;
    total_paginas: number;
    dados: ILeadTotal[];
  };
}

export interface ILeadsTotaisFilters {
  data_criacao_inicio?: string;
  data_criacao_fim?: string;
  pagina?: number;
  limite?: number;
  origem?: string;
  tipo_procura?: string;
  transferidos?: boolean;
  nao_transferidos?: boolean;
  transferido?: boolean | null; // Novo campo para identificar transferido/não transferido ou totais
}

// Interfaces para os dropdowns
export interface IEtapaLead {
  id: number;
  descricao: string;
  ordem: string;
}

export interface ISituacaoLead {
  id: number;
  descricao: string;
}

export interface IConsultor {
  codigo: number;
  nome: string;
}

// Interface para leads dos totais (estrutura diferente da API)
export interface ILeadTotal {
  id: number;
  nome: string;
  telefone: string;
  email: string | null;
  cidade: string | null;
  uf: string | null;
  data_criacao: string;
  vendedor: string | null;
  consultor: string | null;
  situacao: string;
  origem: string;
  procura_para: string | null;
}

// Interface para atividades do lead
export interface ILeadAtividade {
  id: number;
  id_lead: number;
  assunto: string;
  detalhe: string;
  tipo: number;
  data_agenda: string;
  hora_agenda: string;
  detalhe_retorno: string;
}
