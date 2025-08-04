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
  etapa?: string;
  id_consultor?: number;
  id_vendedor?: number;
  pagina?: number;
  limite?: number;
  order_by?: string;
  order_header?: string;
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

export interface ILeadsTotaisFilters {
  data_criacao_inicio?: string;
  data_criacao_fim?: string;
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
